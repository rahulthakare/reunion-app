# Scripts

One-off Node scripts for admin tasks. Run from the project root.

## `import-contacts.ts`

Bulk-import batchmates from a CSV file into the Firestore `contacts` collection.

### Usage

```bash
# Dry run — preview what would be imported (no writes)
npm run import-contacts -- ./scripts/sample-batchmates.csv --dry-run

# Actually write to Firestore
npm run import-contacts -- ./path/to/your-batchmates.csv
```

### CSV format

A header row is **required**. Column names are case-insensitive and a few common
variants are recognized (e.g., `mobile` → `phone`, `surname` → `lastName`).

| Column | Required? | Notes |
|--------|-----------|-------|
| `firstName` | recommended | First name |
| `lastName` | recommended | Last name |
| `email` | optional | Used for whitelist check (PLAN-007). Empty = batchmate can't sign in until added |
| `phone` | optional | Phone / WhatsApp number |
| `city` | optional | Short city label, used for sorting |
| `currentAddress` | optional | Multi-line address (use double-quotes around the value if it contains commas) |
| `permanentAddress` | optional | Family / hometown address |
| `profession` | optional | Job title |
| `company` | optional | Employer |
| `socialLink` | optional | LinkedIn / Facebook URL |
| `showContact` | optional | `true`/`false` — whether phone/email is visible. Defaults to `true`. |

### Behavior

- **Skips duplicates** by email (idempotent — safe to re-run)
- **Logs per-row status** to console
- **Reports a summary** at the end (imported / skipped / errors)
- **Writes go to whichever Firestore project** is configured in `.env.local`

### Example output

```
🚀 NEHS Wardha — Batch '93 — Bulk Contact Importer
Mode: LIVE WRITE to Firestore

📋 Parsed 5 row(s) from CSV: ./scripts/sample-batchmates.csv

📂 Found 0 existing contact(s) with email — will skip duplicates.

✓ Row 2: imported — Rajesh Kumar (rajesh.kumar.test@example.com)
✓ Row 3: imported — Priya Sharma (priya.sharma.test@example.com)
✓ Row 4: imported — Amit Patel
✓ Row 5: imported — Sunita Joshi (sunita.joshi.test@example.com)
✓ Row 6: imported — Vikram Deshmukh (vikram.test@example.com)

─────────── Summary ───────────
✓  Imported : 5
⏭  Skipped  : 0
❌ Errors   : 0
──────────────────────────────
```

### Tip — start with --dry-run

Always run `--dry-run` first to verify your CSV parses correctly. Once happy,
re-run without `--dry-run` to actually write to Firestore.
