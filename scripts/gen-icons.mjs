// Generates the PNG app icons required by the PWA manifest / iOS home screen
// from the single source-of-truth public/icon.svg.
// Run from the project root: node scripts/gen-icons.mjs
import sharp from 'sharp'
import { readFileSync } from 'fs'

const svg = readFileSync('public/icon.svg')

await sharp(svg).resize(192, 192).png().toFile('public/pwa-192.png')
await sharp(svg).resize(512, 512).png().toFile('public/pwa-512.png')
await sharp(svg).resize(180, 180).png().toFile('public/apple-touch-icon.png')

console.log('Generated pwa-192.png, pwa-512.png, apple-touch-icon.png')
