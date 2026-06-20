// Simple on-device progress + streak tracking via localStorage.
// A word is considered "learned" once its box reaches 3 (got it right a few times).

const PROGRESS_KEY = 'esnap_progress_v1'
const STREAK_KEY = 'esnap_streak_v1'

export function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {}
  } catch {
    return {}
  }
}

function saveProgress(p) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(p))
  } catch {
    /* storage full or blocked — ignore */
  }
}

// Record the FIRST-attempt result for a word. Returns the updated progress map.
export function recordAnswer(wordId, correct) {
  const p = loadProgress()
  const e = p[wordId] || { seen: 0, correct: 0, wrong: 0, box: 0 }
  e.seen += 1
  if (correct) {
    e.correct += 1
    e.box = Math.min(5, e.box + 1)
  } else {
    e.wrong += 1
    e.box = Math.max(0, e.box - 1)
  }
  e.lastSeen = Date.now()
  p[wordId] = e
  saveProgress(p)
  return p
}

export function isLearned(entry) {
  return (entry?.box ?? 0) >= 3
}

export function stats(p = loadProgress()) {
  const ids = Object.keys(p)
  return {
    studied: ids.length,
    learned: ids.filter((id) => isLearned(p[id])).length
  }
}

// ---- streak ----
function dayStr(ts = Date.now()) {
  return new Date(ts).toISOString().slice(0, 10)
}

export function loadStreak() {
  try {
    return JSON.parse(localStorage.getItem(STREAK_KEY)) || { count: 0, last: null }
  } catch {
    return { count: 0, last: null }
  }
}

// Call once when a study session starts. Increments the streak for consecutive days.
export function touchStreak() {
  const s = loadStreak()
  const today = dayStr()
  if (s.last === today) return s
  const yesterday = dayStr(Date.now() - 86400000)
  s.count = s.last === yesterday ? s.count + 1 : 1
  s.last = today
  try {
    localStorage.setItem(STREAK_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
  return s
}

// ---- spaced repetition intervals ----
const REVIEW_MS = [
  4 * 3_600_000,   // box 0 → 4 hours
  86_400_000,      // box 1 → 1 day
  3 * 86_400_000,  // box 2 → 3 days
  7 * 86_400_000,  // box 3 → 7 days
  14 * 86_400_000, // box 4 → 14 days
  30 * 86_400_000, // box 5 → 30 days
]

export function nextReviewAt(entry) {
  if (!entry?.lastSeen) return 0
  const box = Math.min(5, entry.box || 0)
  return entry.lastSeen + REVIEW_MS[box]
}

export function isDue(entry) {
  if (!entry) return true
  return Date.now() >= nextReviewAt(entry)
}
