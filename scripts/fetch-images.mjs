// Fetches one photo per vocabulary word from the Pexels API, resizes it with
// sharp, and saves it as a small WebP file at the path given by each word's
// "image" field (relative to public/images/).
//
// Resumable: words whose output file already exists are skipped, so this can
// be re-run safely if interrupted or throttled.
//
// Usage:
//   node scripts/fetch-images.mjs            # process every missing word
//   node scripts/fetch-images.mjs 5          # only process the first 5 missing words (testing)

import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, readdirSync } from 'fs'
import { dirname, join } from 'path'
import sharp from 'sharp'

const API_KEY = readFileSync('REF/pexels_api_key.txt', 'utf8').trim()
const TARGET_WIDTH = 480
const WEBP_QUALITY = 72
const REQUEST_DELAY_MS = 2000
const RETRY_BACKOFF_MS = 5000
const MAX_RETRIES = 10
const limit = Number(process.argv[2]) || Infinity

const catDir = 'src/data/categories'
const words = []
for (const file of readdirSync(catDir).filter((f) => f.endsWith('.json'))) {
  const cat = JSON.parse(readFileSync(join(catDir, file), 'utf8'))
  for (const w of cat.words) words.push(w)
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// Retries on Pexels 429 (throttle) with a fixed backoff.
async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=3&orientation=landscape`
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    const res = await fetch(url, { headers: { Authorization: API_KEY } })
    if (res.status === 429) {
      await sleep(RETRY_BACKOFF_MS)
      continue
    }
    if (!res.ok) {
      throw new Error(`Pexels ${res.status}: ${(await res.text()).slice(0, 200)}`)
    }
    const data = await res.json()
    return data.photos || []
  }
  throw new Error('throttle limit exceeded after retries')
}

const missing = []
let processed = 0
let skipped = 0

for (const w of words) {
  const outPath = join('public/images', w.image)
  if (existsSync(outPath)) {
    skipped++
    continue
  }
  if (processed >= limit) break
  processed++

  mkdirSync(dirname(outPath), { recursive: true })

  let photos = []
  try {
    photos = await searchPexels(w.imageQuery)
    if (!photos.length) {
      const simple = w.imageQuery.split(' ').slice(0, 2).join(' ')
      photos = await searchPexels(simple)
    }
  } catch (e) {
    console.error(`[${w.id}] ERROR searching "${w.imageQuery}": ${e.message}`)
    missing.push({ id: w.id, image: w.image, query: w.imageQuery, reason: e.message })
    await sleep(REQUEST_DELAY_MS)
    continue
  }

  if (!photos.length) {
    console.warn(`[${w.id}] no results for "${w.imageQuery}"`)
    missing.push({ id: w.id, image: w.image, query: w.imageQuery, reason: 'no results' })
    await sleep(REQUEST_DELAY_MS)
    continue
  }

  const src = photos[0].src.large || photos[0].src.medium || photos[0].src.original
  try {
    const imgRes = await fetch(src)
    const buf = Buffer.from(await imgRes.arrayBuffer())
    await sharp(buf).resize({ width: TARGET_WIDTH }).webp({ quality: WEBP_QUALITY }).toFile(outPath)
    const kb = (statSync(outPath).size / 1024).toFixed(1)
    console.log(`[${w.id}] -> ${w.image} (${kb}KB)`)
  } catch (e) {
    console.error(`[${w.id}] ERROR downloading/processing: ${e.message}`)
    missing.push({ id: w.id, image: w.image, query: w.imageQuery, reason: e.message })
  }

  await sleep(REQUEST_DELAY_MS)
}

console.log(`\nDone. processed=${processed} skipped(already-existed)=${skipped} missing=${missing.length} total=${words.length}`)
writeFileSync('scripts/missing-images.json', JSON.stringify(missing, null, 2))
if (missing.length) {
  console.log('See scripts/missing-images.json for words that need attention.')
}
