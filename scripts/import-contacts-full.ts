/**
 * Imports contacts from contact_full.csv into Firestore.
 *
 * CSV columns:
 *   Name, Profession, Address, Current Address, Present Address,
 *   Phone, Email 1, Email 2
 *
 * Mapping:
 *   Name           -> salutation (extracted from honorific) + firstName + lastName
 *   Profession     -> profession
 *   Address        -> permanentAddress
 *   Current Addr.  -> presentAddress (preferred if non-empty)
 *   Present Addr.  -> presentAddress (used if Current Address empty)
 *   Phone          -> phone (with +91 prefix where missing)
 *   Email 1        -> email
 *   Email 2        -> SKIPPED
 *
 * Behavior:
 *   - Wipes the contacts collection BEFORE importing (clean slate)
 *   - Best-effort city extraction from address
 *   - --dry-run to preview without writing
 *
 * Usage:
 *   npm run import-contacts-full -- ./scripts/contact_full.csv --dry-run
 *   npm run import-contacts-full -- ./scripts/contact_full.csv
 */

import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { initializeApp, getApps, getApp, cert, type App } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

// ── Types ────────────────────────────────────────────────────────────

interface CsvRow {
  name: string;
  profession: string;
  address: string;
  currentAddress: string;
  presentAddress: string;
  phone: string;
  email1: string;
  email2: string;
}

interface ParsedContact {
  salutation?: string;
  firstName: string;
  lastName: string;
  name: string;
  city: string;
  permanentAddress?: string;
  presentAddress?: string;
  profession?: string;
  phone?: string;
  email?: string;
  showContact: boolean;
  createdAt: string;
  updatedAt: string;
}

// ── Constants ────────────────────────────────────────────────────────

const HONORIFICS = [
  "Mr.", "Mrs.", "Ms.", "Miss", "Mx.",
  "Dr.", "Prof.", "Adv.", "Adv",
  "Shri", "Shri.", "Smt.", "Smt", "Sri", "Sri.",
  "Mr", "Mrs", "Ms", "Dr", "Prof",
];

// Common Vidarbha / Maharashtra cities for best-effort extraction
const KNOWN_CITIES = [
  "Wardha", "Nagpur", "Mumbai", "Pune", "Thane", "Bhusawal", "Aurangabad",
  "Nashik", "Solapur", "Kolhapur", "Amravati", "Akola", "Yavatmal", "Chandrapur",
  "Gondia", "Bhandara", "Nanded", "Latur", "Beed", "Jalna", "Parbhani",
  "Hinganghat", "Hingoli", "Sevagram", "Pulgaon",
  "Bangalore", "Bengaluru", "Hyderabad", "Chennai", "Delhi", "New Delhi",
  "Gurgaon", "Gurugram", "Noida", "Kolkata", "Ahmedabad", "Surat", "Jaipur",
  "Indore", "Bhopal", "Lucknow", "Kanpur", "Patna", "Ranchi",
];

// ── CSV parsing (handles quoted commas and escaped quotes) ──────────

function parseCsv(content: string): CsvRow[] {
  // Strip BOM
  if (content.charCodeAt(0) === 0xfeff) content = content.slice(1);

  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = parseCsvLine(lines[0]).map((h) => h.trim().toLowerCase());
  const colIdx = (name: string) =>
    headers.findIndex((h) => h === name.toLowerCase());

  const idxName = colIdx("Name");
  const idxProf = colIdx("Profession");
  const idxAddr = colIdx("Address");
  const idxCurr = colIdx("Current Address");
  const idxPres = colIdx("Present Address");
  const idxPhone = colIdx("Phone");
  const idxEmail1 = colIdx("Email 1");
  const idxEmail2 = colIdx("Email 2");

  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    return {
      name: cells[idxName] ?? "",
      profession: cells[idxProf] ?? "",
      address: cells[idxAddr] ?? "",
      currentAddress: cells[idxCurr] ?? "",
      presentAddress: cells[idxPres] ?? "",
      phone: cells[idxPhone] ?? "",
      email1: cells[idxEmail1] ?? "",
      email2: cells[idxEmail2] ?? "",
    };
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // skip the escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result.map((c) => c.trim());
}

// ── Helpers ──────────────────────────────────────────────────────────

/** Extract honorific from name; returns { salutation, rest }
 *
 *  Handles: "Mr. Foo", "Mr.Foo" (no space), "MR FOO" (case-insensitive),
 *           " Mr. Foo" (leading whitespace handled by trim above).
 */
function extractSalutation(rawName: string): { salutation?: string; rest: string } {
  const name = rawName.trim();
  for (const h of HONORIFICS) {
    // Escape any literal "." in the honorific for regex
    const escaped = h.replace(/\./g, "\\.");
    // Allow optional whitespace OR enforce a non-letter boundary after.
    // This matches "Mr. Foo", "Mr.Foo", "Mr Foo".
    const re = new RegExp(`^${escaped}(?:\\s+|(?=[^A-Za-z]))`, "i");
    if (re.test(name)) {
      const normalised = h.endsWith(".") ? h : `${h}.`;
      // Strip leftover leading punctuation (e.g. ".Kiran" after stripping "Mr.")
      const rest = name.replace(re, "").replace(/^[.,;:\s]+/, "").trim();
      return { salutation: normalised, rest };
    }
  }
  return { rest: name };
}

/** Split "First Middle Last" or "First Last (Maiden)" into firstName / lastName.
 *
 *  Parenthetical parts are treated as annotations attached to the preceding
 *  surname (e.g. maiden name) — they're glued onto the lastName so the
 *  REAL surname is the basis of initials/sorting, not the parens.
 *
 *  Examples:
 *    "Rewati Jha (Acharya)"     -> firstName: "Rewati",        lastName: "Jha (Acharya)"
 *    "Mahendra Prabhakarrao Gade" -> firstName: "Mahendra Prabhakarrao", lastName: "Gade"
 *    "Sarang"                    -> firstName: "Sarang",       lastName: ""
 */
function splitName(fullName: string): { firstName: string; lastName: string } {
  const cleaned = fullName.trim();
  if (!cleaned) return { firstName: "", lastName: "" };

  // Step 1: pull off any trailing parenthetical group (e.g. "(Acharya)")
  // and keep it aside. We'll glue it back to the lastName at the end.
  let working = cleaned;
  let trailingParen = "";
  const parenMatch = working.match(/\s*(\([^)]*\))\s*$/);
  if (parenMatch) {
    trailingParen = parenMatch[1];
    working = working.slice(0, parenMatch.index).trim();
  }

  const parts = working.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: trailingParen };
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: trailingParen };
  }

  const firstName = parts.slice(0, parts.length - 1).join(" ");
  const lastNameCore = parts[parts.length - 1];
  const lastName = trailingParen ? `${lastNameCore} ${trailingParen}` : lastNameCore;
  return { firstName, lastName };
}

/** Best-effort city extraction from address */
function extractCity(address: string): string {
  if (!address) return "";
  for (const city of KNOWN_CITIES) {
    const re = new RegExp(`\\b${city}\\b`, "i");
    if (re.test(address)) return city === "Bengaluru" ? "Bangalore" : city;
  }
  return "";
}

/** Normalize phone — add +91 prefix if 10 digits and missing prefix */
function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[\s-()]/g, "").trim();
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) return cleaned;
  if (/^\d{10}$/.test(cleaned)) return `+91 ${cleaned}`;
  if (/^91\d{10}$/.test(cleaned)) return `+${cleaned.slice(0, 2)} ${cleaned.slice(2)}`;
  return cleaned;
}

/** Convert a CSV row to a Contact object */
function rowToContact(row: CsvRow): ParsedContact | null {
  if (!row.name || !row.name.trim()) return null;

  const { salutation, rest } = extractSalutation(row.name);
  const { firstName, lastName } = splitName(rest);

  // Prefer Current Address; fall back to Present Address
  const presentAddress = row.currentAddress.trim() || row.presentAddress.trim() || undefined;
  const permanentAddress = row.address.trim() || undefined;

  // City extraction: try presentAddress first, then permanentAddress
  const city = extractCity(presentAddress || "") || extractCity(permanentAddress || "") || "—";

  const now = new Date().toISOString();

  const contact: ParsedContact = {
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    city,
    showContact: true,
    createdAt: now,
    updatedAt: now,
  };

  // Optional fields — only add if non-empty
  if (salutation) contact.salutation = salutation;
  if (presentAddress) contact.presentAddress = presentAddress;
  if (permanentAddress) contact.permanentAddress = permanentAddress;
  if (row.profession.trim()) contact.profession = row.profession.trim();
  const phone = normalizePhone(row.phone);
  if (phone) contact.phone = phone;
  if (row.email1.trim()) contact.email = row.email1.trim().toLowerCase();

  return contact;
}

// ── Firebase Admin ───────────────────────────────────────────────────

function getAdminApp(): App {
  if (getApps().length > 0) return getApp();
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Missing Firebase Admin env vars. Need FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY."
    );
  }
  return initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

// ── Main import ──────────────────────────────────────────────────────

async function importContacts(filePath: string, dryRun: boolean) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const rows = parseCsv(content);

  console.log(`\n📄 Read ${rows.length} rows from ${filePath}`);

  const parsed: ParsedContact[] = [];
  const skipped: string[] = [];
  for (const row of rows) {
    const c = rowToContact(row);
    if (c) parsed.push(c);
    else skipped.push(row.name || "(no name)");
  }

  console.log(`✓ Parsed ${parsed.length} contacts. Skipped ${skipped.length} rows with no name.`);

  // Show preview of first 5
  console.log("\n📋 PREVIEW — first 5 records:");
  parsed.slice(0, 5).forEach((c, i) => {
    console.log(`\n  ${i + 1}. ${c.salutation || ""} ${c.firstName} ${c.lastName}`.trim());
    console.log(`     City:        ${c.city}`);
    if (c.profession) console.log(`     Profession:  ${c.profession.slice(0, 70)}${c.profession.length > 70 ? "…" : ""}`);
    if (c.phone) console.log(`     Phone:       ${c.phone}`);
    if (c.email) console.log(`     Email:       ${c.email}`);
    if (c.permanentAddress) console.log(`     Permanent:   ${c.permanentAddress.slice(0, 70)}${c.permanentAddress.length > 70 ? "…" : ""}`);
    if (c.presentAddress) console.log(`     Present:     ${c.presentAddress.slice(0, 70)}${c.presentAddress.length > 70 ? "…" : ""}`);
  });

  // Stats
  const withPhone = parsed.filter((c) => c.phone).length;
  const withEmail = parsed.filter((c) => c.email).length;
  const withCity = parsed.filter((c) => c.city && c.city !== "—").length;
  const withSalutation = parsed.filter((c) => c.salutation).length;
  const cityCounts: Record<string, number> = {};
  parsed.forEach((c) => { cityCounts[c.city] = (cityCounts[c.city] || 0) + 1; });
  const topCities = Object.entries(cityCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  console.log("\n📊 STATISTICS:");
  console.log(`   Total contacts:       ${parsed.length}`);
  console.log(`   With salutation:      ${withSalutation} / ${parsed.length}`);
  console.log(`   With phone:           ${withPhone} / ${parsed.length}`);
  console.log(`   With email:           ${withEmail} / ${parsed.length}`);
  console.log(`   With city extracted:  ${withCity} / ${parsed.length}`);
  console.log("\n   Top cities:");
  topCities.forEach(([city, n]) => console.log(`     • ${city.padEnd(15)} ${n}`));

  if (dryRun) {
    console.log("\n🔵 DRY RUN — no writes performed. Re-run without --dry-run to import.\n");
    return;
  }

  // ── Real import — wipe and rebuild ──
  console.log("\n⚠️  WIPING existing 'contacts' collection…");
  const adminApp = getAdminApp();
  const db = getFirestore(adminApp);
  const existing = await db.collection("contacts").get();
  let deleted = 0;
  for (const doc of existing.docs) {
    await doc.ref.delete();
    deleted++;
  }
  console.log(`   Deleted ${deleted} existing contacts.`);

  console.log(`\n📥 Writing ${parsed.length} new contacts…`);
  let written = 0;
  for (const c of parsed) {
    await db.collection("contacts").add(c);
    written++;
    if (written % 10 === 0) console.log(`   …${written} written`);
  }
  console.log(`\n✅ Done! Wrote ${written} contacts. (Wiped ${deleted} previous records.)\n`);
}

// ── CLI entry ────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const filePath = args.find((a) => !a.startsWith("--"));
  const dryRun = args.includes("--dry-run");

  if (!filePath) {
    console.error("Usage: npm run import-contacts-full -- <path-to-csv> [--dry-run]");
    process.exit(1);
  }

  try {
    await importContacts(path.resolve(filePath), dryRun);
    process.exit(0);
  } catch (err) {
    console.error("\n❌ Import failed:", err);
    process.exit(1);
  }
}

main();
