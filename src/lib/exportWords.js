function sortedGroups(words, sortBy) {
  if (sortBy === 'az') {
    return [{ category: null, words: [...words].sort((a, b) => a.es.localeCompare(b.es)) }]
  }
  const map = new Map()
  for (const w of words) {
    const cat = w.categoryName || 'Other'
    if (!map.has(cat)) map.set(cat, [])
    map.get(cat).push(w)
  }
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cat, ws]) => ({ category: cat, words: ws.sort((a, b) => a.es.localeCompare(b.es)) }))
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

function download(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 100)
}

function sexLabel(gender) {
  if (gender === 'm') return 'masc.'
  if (gender === 'f') return 'fem.'
  return '—'
}

export function exportCSV(words, sortBy) {
  const groups = sortedGroups(words, sortBy)
  const lines = ['"Spanish","Type","English","Sex"']

  for (const { category, words: ws } of groups) {
    if (category) lines.push(`"${category}","","",""`)
    for (const w of ws) {
      const row = [w.es, w.pos || '', w.en, sexLabel(w.gender)]
        .map((c) => `"${String(c).replace(/"/g, '""')}"`)
      lines.push(row.join(','))
    }
    if (category) lines.push('')
  }

  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  download(blob, `mis-palabras-${today()}.csv`)
}

export function exportPDF(words, sortBy) {
  const groups = sortedGroups(words, sortBy)
  const dateStr = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })

  let rows = ''
  for (const { category, words: ws } of groups) {
    if (category) {
      rows += `<tr class="cat-row"><td colspan="4">${category}</td></tr>`
    }
    for (const w of ws) {
      rows += `<tr>
        <td class="col-es">${w.es}</td>
        <td class="col-type">${w.pos || ''}</td>
        <td class="col-en">${w.en}</td>
        <td class="col-sex">${sexLabel(w.gender)}</td>
      </tr>`
    }
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Mis palabras maestras</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:12px;color:#1a1a1a;padding:28px 32px}
.back-btn{display:inline-flex;align-items:center;gap:6px;background:#0f766e;color:#fff;border:none;border-radius:8px;padding:10px 18px;font-size:14px;font-weight:600;cursor:pointer;margin-bottom:24px;font-family:inherit}
.back-btn:active{opacity:.85}
h1{font-size:20px;font-weight:600;margin-bottom:4px}
.meta{color:#777;font-size:11px;margin-bottom:22px}
table{width:100%;border-collapse:collapse}
th{text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:.05em;color:#999;padding:6px 12px 6px 0;border-bottom:1.5px solid #222}
td{padding:9px 12px 9px 0;border-bottom:.5px solid #e8e8e8;vertical-align:top}
.col-es{font-weight:600;width:30%}
.col-type{width:15%;color:#555;font-style:italic}
.col-en{width:32%}
.col-sex{width:12%;color:#888}
.cat-row td{background:#f4f4f4;font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.04em;padding:7px 12px;color:#444;border-bottom:none}
@media print{@page{margin:16mm 14mm}tr{page-break-inside:avoid}.back-btn{display:none}}
</style>
</head>
<body>
<button class="back-btn" onclick="window.close()">← Back to app</button>
<h1>My mastered words</h1>
<p class="meta">Español Snap &nbsp;·&nbsp; ${dateStr} &nbsp;·&nbsp; ${words.length} words</p>
<table>
  <thead><tr><th>Spanish</th><th>Type</th><th>English</th><th>Sex</th></tr></thead>
  <tbody>${rows}</tbody>
</table>
<script>window.onload=()=>window.print()</script>
</body>
</html>`

  const win = window.open('', '_blank')
  if (win) {
    win.document.write(html)
    win.document.close()
  }
}
