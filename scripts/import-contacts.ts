/**
 * Bulk import contacts from a CSV file into the Firestore `contacts` collection.
 *
 * Usage:
 *   npm run import-contacts -- ./batchmates.csv
 *   npm run import-contacts -- ./batchmates.csv --dry-run    (preview without writing)
 *
 * Expected CSV columns (header row required, case-insensitive):
 *   firstName, lastName, email, phone, city, currentAddress,
 *   permanentAddress, profession, company, socialLink, showContact
 *
 * Behavior:
 *   - Skips rows where `email` matches an existing contact (idempotent re-runs)
 *   - Allows rows with empty email (logs warning) — admin can edit later
 *   - Empty fields default to ""
 *   - showContact: parsed as boolean ("true"/"false"/"1"/"0"/empty=true)
 *   - Reports per-row status at the end
 *
 * Loads Firebase Admin credentials from .env.local (same as the app).
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { config as loadEnv } from "dotenv";
import {
  initializeApp,
  getApps,
  cert,
  type App,
} from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Load .env.local so FIREBASE_ADMIN_* vars are available
loadEnv({ path: ".env.local" });

interface CsvRow {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  city?: string;
  currentAddress?: string;
  permanentAddress?: string;
  profession?: string;
  company?: string;
  socialLink?: string;
  showContact?: string;
  [key: string]: string | undefined;
}

interface ImportResult {
  imported: number;
  skipped: number;
  errors: number;
  details: Array<{ row: number; email: string; status: "imported" | "skipped" | "error"; reason?: string }>;
}

// ─── CSV Parser (small built-in to avoid extra dependency) ───────────────────
function parseCsv(content: string): CsvRow[] {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCsvLine(lines[i]);
    const row: CsvRow = {};
    headers.forEach((h, idx) => {
      // Normalize header keys to camelCase variants we expect
      const key = normalizeHeader(h);
      row[key] = (values[idx] ?? "").trim();
    });
    rows.push(row);
  }
  return rows;
}

// Handle quoted values, commas inside quotes, escaped quotes
function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  out.push(current);
  return out;
}

// Map common header variants to our canonical field names
function normalizeHeader(header: string): string {
  const h = header.toLowerCase().replace(/[\s_-]+/g, "");
  const map: Record<string, string> = {
    firstname: "firstName",
    fname: "firstName",
    first: "firstName",
    lastname: "lastName",
    lname: "lastName",
    last: "lastName",
    surname: "lastName",
    email: "email",
    emailaddress: "email",
    mail: "email",
    phone: "phone",
    mobile: "phone",
    whatsapp: "phone",
    phonenumber: "phone",
    city: "city",
    currentaddress: "currentAddress",
    address: "currentAddress",
    permanentaddress: "permanentAddress",
    homeaddress: "permanentAddress",
    profession: "profession",
    occupation: "profession",
    job: "profession",
    jobtitle: "profession",
    work: "profession",
    company: "company",
    employer: "company",
    organization: "company",
    sociallink: "socialLink",
    linkedin: "socialLink",
    facebook: "socialLink",
    showcontact: "showContact",
    visible: "showContact",
  };
  return map[h] ?? header;
}

function parseBool(value: string | undefined): boolean {
  if (!value) return true; // default to visible
  const v = value.toString().toLowerCase().trim();
  if (v === "false" || v === "0" || v === "no" || v === "n") return false;
  return true;
}

// ─── Firebase Admin init ─────────────────────────────────────────────────────
function getAdminApp(): App {
  if (getApps().length > 0) return getApps()[0];

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, or FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
    );
  }

  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

// ─── Main import ─────────────────────────────────────────────────────────────
async function importContacts(filePath: string, dryRun: boolean): Promise<ImportResult> {
  const absPath = resolve(filePath);
  if (!existsSync(absPath)) {
    throw new Error(`CSV file not found: ${absPath}`);
  }

  const content = readFileSync(absPath, "utf-8");
  const rows = parseCsv(content);

  console.log(`\n📋 Parsed ${rows.length} row(s) from CSV: ${absPath}\n`);

  const app = getAdminApp();
  const db: Firestore = getFirestore(app);

  // Pre-fetch all existing emails for fast deduplication
  const snapshot = await db.collection("contacts").get();
  const existingEmails = new Set<string>();
  snapshot.docs.forEach((doc) => {
    const email = (doc.data().email ?? "").toString().toLowerCase().trim();
    if (email) existingEmails.add(email);
  });
  console.log(`📂 Found ${existingEmails.size} existing contact(s) with email — will skip duplicates.\n`);

  const result: ImportResult = { imported: 0, skipped: 0, errors: 0, details: [] };
  const now = new Date().toISOString();

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const rowNum = i + 2; // +2 because row 1 is the header, and humans count from 1
    const email = (row.email ?? "").toLowerCase().trim();

    try {
      // Skip if email already exists
      if (email && existingEmails.has(email)) {
        result.skipped++;
        result.details.push({ row: rowNum, email, status: "skipped", reason: "Email already exists" });
        console.log(`⏭️  Row ${rowNum}: skipped (${email} already exists)`);
        continue;
      }

      // Validate required fields — at least firstName + lastName, OR email
      const firstName = (row.firstName ?? "").trim();
      const lastName = (row.lastName ?? "").trim();
      const city = (row.city ?? "").trim();

      if (!firstName && !lastName && !email) {
        result.skipped++;
        result.details.push({ row: rowNum, email: "", status: "skipped", reason: "Empty row (no name or email)" });
        console.log(`⏭️  Row ${rowNum}: skipped (empty row)`);
        continue;
      }

      const contact = {
        firstName,
        lastName,
        name: `${firstName} ${lastName}`.trim() || email || "(unknown)",
        email,
        city,
        currentAddress: (row.currentAddress ?? "").trim(),
        permanentAddress: (row.permanentAddress ?? "").trim(),
        phone: (row.phone ?? "").trim(),
        profession: (row.profession ?? "").trim(),
        company: (row.company ?? "").trim(),
        socialLink: (row.socialLink ?? "").trim(),
        showContact: parseBool(row.showContact),
        createdAt: now,
        updatedAt: now,
      };

      if (dryRun) {
        result.imported++;
        result.details.push({ row: rowNum, email, status: "imported", reason: "DRY RUN" });
        console.log(`✓ Row ${rowNum}: would import — ${contact.name}${email ? ` (${email})` : ""}`);
      } else {
        await db.collection("contacts").add(contact);
        if (email) existingEmails.add(email); // prevent dupes within this CSV run
        result.imported++;
        result.details.push({ row: rowNum, email, status: "imported" });
        console.log(`✓ Row ${rowNum}: imported — ${contact.name}${email ? ` (${email})` : ""}`);
      }
    } catch (err) {
      result.errors++;
      const message = err instanceof Error ? err.message : String(err);
      result.details.push({ row: rowNum, email, status: "error", reason: message });
      console.error(`❌ Row ${rowNum}: error — ${message}`);
    }
  }

  return result;
}

// ─── Entry point ─────────────────────────────────────────────────────────────
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const filePath = args.find((a) => !a.startsWith("--"));

  if (!filePath) {
    console.error("Usage: npm run import-contacts -- <path-to-csv> [--dry-run]");
    process.exit(1);
  }

  console.log(`\n🚀 NEHS Wardha — Batch '93 — Bulk Contact Importer`);
  console.log(`Mode: ${dryRun ? "DRY RUN (no writes)" : "LIVE WRITE to Firestore"}`);

  try {
    const result = await importContacts(filePath, dryRun);

    console.log(`\n─────────── Summary ───────────`);
    console.log(`✓  Imported : ${result.imported}`);
    console.log(`⏭  Skipped  : ${result.skipped}`);
    console.log(`❌ Errors   : ${result.errors}`);
    console.log(`──────────────────────────────\n`);

    if (dryRun) {
      console.log(`💡 This was a DRY RUN — no data was written.`);
      console.log(`   Re-run without --dry-run to actually import.\n`);
    }
    process.exit(result.errors > 0 ? 1 : 0);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\n❌ Import failed: ${message}\n`);
    process.exit(1);
  }
}

main();
