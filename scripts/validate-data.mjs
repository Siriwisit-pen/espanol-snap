// Sanity-checks the vocabulary dataset: unique category/word ids, unique
// image paths, and required fields present on every word.
import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'

const catDir = 'src/data/categories'
const files = readdirSync(catDir).filter((f) => f.endsWith('.json')).sort()

const seenCatIds = new Map()
const seenWordIds = new Map()
const seenImages = new Map()
const required = ['id', 'es', 'en', 'pos', 'hint', 'scenarios', 'imageQuery', 'image']
let totalWords = 0
let problems = 0

for (const file of files) {
  const cat = JSON.parse(readFileSync(join(catDir, file), 'utf8'))

  if (seenCatIds.has(cat.id)) {
    console.log(`DUPLICATE category id "${cat.id}" in ${file} and ${seenCatIds.get(cat.id)}`)
    problems++
  }
  seenCatIds.set(cat.id, file)

  for (const w of cat.words) {
    totalWords++
    for (const key of required) {
      if (w[key] === undefined) {
        console.log(`MISSING "${key}" on word ${w.id ?? '(no id)'} in ${file}`)
        problems++
      }
    }
    if (seenWordIds.has(w.id)) {
      console.log(`DUPLICATE word id "${w.id}" in ${file} and ${seenWordIds.get(w.id)}`)
      problems++
    }
    seenWordIds.set(w.id, file)

    if (seenImages.has(w.image)) {
      console.log(`DUPLICATE image path "${w.image}" (${w.id} in ${file} and ${seenImages.get(w.image)})`)
      problems++
    }
    seenImages.set(w.image, w.id)

    if (!/^[a-z0-9-]+\/[a-z0-9-]+\.webp$/.test(w.image)) {
      console.log(`UNEXPECTED image path format "${w.image}" for ${w.id} in ${file}`)
      problems++
    }
  }
}

console.log(`\n${files.length} categories, ${totalWords} words total.`)
console.log(problems === 0 ? 'No problems found.' : `${problems} problem(s) found.`)
