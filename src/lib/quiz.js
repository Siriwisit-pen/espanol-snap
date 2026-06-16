// Quiz helpers: shuffling, building multiple-choice options, and picking
// which word to show next (lightweight spaced repetition).

export function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Build 4 options (the answer + 3 plausible distractors from the same category).
export function buildOptions(word, categoryWords) {
  const distractors = shuffle(categoryWords.filter((w) => w.id !== word.id)).slice(0, 3)
  return shuffle([word, ...distractors])
}

// Weighted random pick: unseen and "weak" words (low box) come up more often.
export function pickWord(pool, progress, avoidId = null) {
  const candidates = pool.length > 1 && avoidId ? pool.filter((w) => w.id !== avoidId) : pool
  const weights = candidates.map((w) => {
    const e = progress[w.id]
    if (!e) return 7 // never seen → prioritize
    return Math.max(1, 6 - Math.min(5, e.box)) // box 0 → 6 ... box 5 → 1
  })
  const total = weights.reduce((a, b) => a + b, 0)
  let r = Math.random() * total
  for (let i = 0; i < candidates.length; i++) {
    r -= weights[i]
    if (r <= 0) return candidates[i]
  }
  return candidates[candidates.length - 1]
}
