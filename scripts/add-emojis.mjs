import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const emojis = {
  'food-drink': '🍎',
  'restaurant-cafe': '🍽️',
  'family-people': '👨‍👩‍👧',
  'body-health': '💪',
  clothing: '👕',
  'house-home': '🏠',
  'kitchen-cooking': '🍳',
  'travel-transport': '✈️',
  'city-directions': '🏙️',
  'shopping-money': '🛍️',
  'work-office': '💼',
  'school-study': '📚',
  'numbers-time-dates': '🕐',
  'weather-nature': '⛅',
  animals: '🐾',
  'colors-shapes': '🎨',
  'common-verbs-actions': '🏃',
  'emotions-feelings': '😊',
  'technology-phone': '📱',
  'greetings-daily-routine': '👋',
  fruits: '🍓',
  vegetables: '🥦',
  'sports-exercise': '⚽',
  'music-arts': '🎵',
  'plants-garden': '🌱',
  'countries-travel': '🌍',
  'celebrations-events': '🎉',
  'personality-character': '🧠',
  environment: '🌿',
  'tools-materials': '🔧',
  'health-medical': '🏥',
  'business-finance': '💰',
}

const catDir = 'src/data/categories'
import { readdirSync } from 'fs'

for (const file of readdirSync(catDir).filter(f => f.endsWith('.json'))) {
  const path = join(catDir, file)
  const data = JSON.parse(readFileSync(path, 'utf8'))
  const emoji = emojis[data.id]
  if (!emoji) { console.warn(`No emoji for ${data.id}`); continue }
  data.emoji = emoji
  writeFileSync(path, JSON.stringify(data, null, 2), 'utf8')
  console.log(`✓ ${data.id} → ${emoji}`)
}

console.log('Done.')
