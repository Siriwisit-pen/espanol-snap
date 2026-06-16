const modules = import.meta.glob('./*.json', { eager: true })

const conversations = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order)

export const levels = {
  1: { name: 'Level 1', description: 'Greetings & everyday basics' },
  2: { name: 'Level 2', description: 'Out and about' },
  3: { name: 'Level 3', description: 'Daily life' },
  4: { name: 'Level 4', description: 'Getting things done' },
  5: { name: 'Level 5', description: 'Opinions & feelings' },
  6: { name: 'Level 6', description: 'Real situations' },
}

export default conversations
