import "dotenv/config"
import { createClient } from "@supabase/supabase-js"
import { parse } from "csv-parse/sync"
import { readFileSync } from "node:fs"
import { createHash } from "node:crypto"

const SUPABASE_URL = process.env.SUPABASE_URL
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in your env.")
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

const filePath = process.argv[2]
if (!filePath) {
  console.error("Usage: npm run import:csv -- path/to/products.csv")
  process.exit(1)
}

function splitList(value) {
  if (!value) return []
  return value.split("|").map((v) => v.trim()).filter(Boolean)
}

function deriveExternalId(row) {
  if (row.external_id) return row.external_id.trim()
  // Stable fallback so re-importing the same CSV updates rows instead of duplicating them
  return createHash("sha1").update(row.affiliate_link).digest("hex").slice(0, 24)
}

async function main() {
  const raw = readFileSync(filePath, "utf-8")
  const rows = parse(raw, { columns: true, skip_empty_lines: true, trim: true })

  console.log(`Parsed ${rows.length} rows from ${filePath}`)

  const products = []
  const errors = []

  rows.forEach((row, i) => {
    const lineNo = i + 2 // +1 for header, +1 for 1-indexing

    if (!row.title || !row.price || !row.affiliate_link || !row.source_platform || !row.category) {
      errors.push(`Line ${lineNo}: missing a required field (title, price, affiliate_link, source_platform, category)`)
      return
    }

    if (!["fashion", "beauty"].includes(row.category)) {
      errors.push(`Line ${lineNo}: category must be "fashion" or "beauty", got "${row.category}"`)
      return
    }

    const price = Number(row.price)
    if (Number.isNaN(price)) {
      errors.push(`Line ${lineNo}: price "${row.price}" is not a number`)
      return
    }

    products.push({
      external_id: deriveExternalId(row),
      source_platform: row.source_platform,
      title: row.title,
      description: row.description || null,
      price,
      images: splitList(row.image_urls),
      affiliate_link: row.affiliate_link,
      aesthetic_tags: splitList(row.aesthetic_tags),
      category: row.category,
    })
  })

  if (errors.length > 0) {
    console.error(`\n${errors.length} row(s) skipped due to errors:`)
    errors.forEach((e) => console.error(`  - ${e}`))
  }

  if (products.length === 0) {
    console.error("\nNo valid rows to import.")
    process.exit(1)
  }

  const { error } = await supabase
    .from("products")
    .upsert(products, { onConflict: "source_platform,external_id" })

  if (error) {
    console.error("Upsert failed:", error.message)
    process.exit(1)
  }

  console.log(`\nImported/updated ${products.length} products.`)
}

main()