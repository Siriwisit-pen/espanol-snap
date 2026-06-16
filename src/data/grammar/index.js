const modules = import.meta.glob('./*.json', { eager: true })

const grammarTopics = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order)

export const groups = {
  A: { name: 'The Basics', description: 'Gender, articles, plurals & numbers' },
  B: { name: 'Ser, Estar & Verbs', description: 'To be, present tense, key irregulars' },
  C: { name: 'Building Sentences', description: 'Adjectives, possessives, pronouns & questions' },
}

export default grammarTopics
