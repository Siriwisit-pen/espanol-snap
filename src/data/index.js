// Auto-loads every category file in ./categories/*.json at build time.
// To add a category, just drop a new JSON file in that folder — no code changes needed.
const modules = import.meta.glob('./categories/*.json', { eager: true })

export const categories = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => (a.order ?? 999) - (b.order ?? 999))

// id -> array of that category's words (used to build plausible wrong answers)
export const wordsByCategory = Object.fromEntries(
  categories.map((c) => [c.id, c.words.map((w) => ({ ...w, categoryId: c.id, categoryName: c.name }))])
)

// flat list of every word, tagged with its category
export const allWords = categories.flatMap((c) => wordsByCategory[c.id])
