import { allWords } from '../data/index.js'

export function getWordOfDay() {
  const day = Math.floor(Date.now() / 86400000)
  return allWords[day % allWords.length]
}
