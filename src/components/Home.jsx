import { useMemo } from 'react'
import { loadProgress, loadStreak, stats, isLearned } from '../lib/progress.js'
import { loadConvProgress } from '../lib/convProgress.js'
import { loadGrammarProgress } from '../lib/grammarProgress.js'
import conversations from '../data/conversations/index.js'
import grammarTopics from '../data/grammar/index.js'

export default function Home({ categories, onStartMixed, onStartCategory, onConversations, onGrammar }) {
  const progress = useMemo(() => loadProgress(), [])
  const s = useMemo(() => stats(progress), [progress])
  const streak = useMemo(() => loadStreak(), [])
  const convProgress = useMemo(() => loadConvProgress(), [])
  const grammarProgress = useMemo(() => loadGrammarProgress(), [])

  const convDone = Object.values(convProgress).filter((p) => p.done).length
  const grammarDone = Object.values(grammarProgress).filter((p) => p.done).length

  return (
    <div className="home">
      <header className="home-head">
        <div className="home-logo">ES</div>
        <div>
          <h1 className="home-title">Español Snap</h1>
          <p className="home-tag">Learn Spanish with pictures & practice</p>
        </div>
      </header>

      <div className="stats-strip">
        <div className="stat-chip">
          <span className="stat-chip-num">🔥 {streak.count}</span>
          <span className="stat-chip-lbl">streak</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-chip">
          <span className="stat-chip-num">{s.learned}</span>
          <span className="stat-chip-lbl">learned</span>
        </div>
        <div className="stat-divider" />
        <div className="stat-chip">
          <span className="stat-chip-num">{s.studied}</span>
          <span className="stat-chip-lbl">seen</span>
        </div>
      </div>

      <div className="mode-cards">
        <button className="mode-card mode-card-primary" onClick={onStartMixed}>
          <span className="mode-card-icon">🎯</span>
          <div className="mode-card-body">
            <span className="mode-card-title">Quick play</span>
            <span className="mode-card-desc">{s.studied > 0 ? `${s.learned} learned · ` : ''}{categories.reduce((n, c) => n + c.words.length, 0)} words</span>
          </div>
          <span className="mode-card-arr">›</span>
        </button>

        <button className="mode-card" onClick={onConversations}>
          <span className="mode-card-icon">💬</span>
          <div className="mode-card-body">
            <span className="mode-card-title">Conversations</span>
            <span className="mode-card-desc">{conversations.length} dialogues{convDone > 0 ? ` · ${convDone} done` : ''}</span>
          </div>
          <span className="mode-card-arr">›</span>
        </button>

        <button className="mode-card" onClick={onGrammar}>
          <span className="mode-card-icon">📘</span>
          <div className="mode-card-body">
            <span className="mode-card-title">Grammar</span>
            <span className="mode-card-desc">{grammarTopics.length} topics{grammarDone > 0 ? ` · ${grammarDone} done` : ''}</span>
          </div>
          <span className="mode-card-arr">›</span>
        </button>
      </div>

      <h2 className="section">By category</h2>
      <div className="cat-grid">
        {categories.map((cat) => {
          const total = cat.words.length
          const learned = cat.words.filter((w) => isLearned(progress[w.id])).length
          const pct = Math.round((learned / total) * 100)
          return (
            <button key={cat.id} className="cat-card" onClick={() => onStartCategory(cat)}>
              <span className="cat-name">{cat.name}</span>
              <span className="cat-name-es">{cat.nameEs}</span>
              <div className="cat-prog-bar">
                <div className="cat-prog-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="cat-prog">{learned}/{total}</span>
            </button>
          )
        })}
      </div>

      <p className="footnote">Works fully offline · progress saved on this device</p>
    </div>
  )
}
