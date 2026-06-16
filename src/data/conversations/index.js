const modules = import.meta.glob('./*.json', { eager: true })

const conversations = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order)

export const levels = {
  1: { name: 'Level 1', description: 'Greetings & everyday basics' },
  2: { name: 'Level 2', description: 'Out and about' },
}

export default conversations
