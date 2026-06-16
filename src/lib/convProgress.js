const KEY = 'esnap_conv_v1'

export function loadConvProgress() {
  try { return JSON.parse(localStorage.getItem(KEY)) || {} }
  catch { return {} }
}

function save(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)) } catch {}
}

export function markConvDone(convId, perfect) {
  const p = loadConvProgress()
  const existing = p[convId] || {}
  p[convId] = {
    done: true,
    perfect: perfect || existing.perfect || false,
    lastDone: Date.now(),
  }
  save(p)
  return p
}
