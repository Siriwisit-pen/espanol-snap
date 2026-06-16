const KEY = 'esnap_grammar_v1'

export function loadGrammarProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} }
  catch { return {} }
}

function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch {}
}

export function markGrammarDone(topicId, score, total) {
  const p = loadGrammarProgress()
  const existing = p[topicId] || {}
  p[topicId] = {
    done: true,
    perfect: score === total || existing.perfect || false,
    score,
    total,
    lastDone: Date.now(),
  }
  save(p)
  return p
}
