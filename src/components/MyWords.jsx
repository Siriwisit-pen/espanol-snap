import { useMemo, useState } from 'react'
import { allWords } from '../data/index.js'
import { loadProgress, isLearned } from '../lib/progress.js'
import { speak } from '../lib/speech.js'

const LEVELS = ['A', 'B', 'C']
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'mastered', label: 'Mastered' },
  { key: 'progress', label: 'In progress' },
]

export default function MyWords({ onBack, onQuiz }) {
  const progress = useMemo(() => loadProgress(), [])
  const [filter, setFilter] = useState('all')
  const [activeLevels, setActiveLevels] = useState(new Set(['A', 'B', 'C']))

  const touchedWords = useMemo(() => {
    const ids = new Set(Object.keys(progress))
    return allWords.filter((w) => ids.has(w.id))
  }, [progress])

  const filteredWords = useMemo(() => {
    return touchedWords.filter((w) => {
      const lvl = w.level || 'A'
      if (!activeLevels.has(lvl)) return false
      const entry = progress[w.id]
      if (filter === 'mastered') return isLearned(entry)
      if (filter === 'progress') return !isLearned(entry)
      return true
    })
  }, [touchedWords, filter, activeLevels, progress])

  function toggleLevel(lvl) {
    setActiveLevels((prev) => {
      const next = new Set(prev)
      if (next.has(lvl) && next.size > 1) next.delete(lvl)
      else next.add(lvl)
      return next
    })
  }

  const mastered = touchedWords.filter((w) => isLearned(progress[w.id])).length
  const inProgress = touchedWords.length - mastered

  return (
    <div className="mw-screen">
      <header className="mw-bar">
        <button className="link" onClick={onBack}>← Back</button>
        <h1 className="mw-title">My Words</h1>
        <div className="mw-bar-spacer" />
      </header>

      {touchedWords.length === 0 ? (
        <div className="mw-empty">
          <div className="mw-empty-icon">📚</div>
          <p className="mw-empty-heading">No words yet</p>
          <p className="mw-empty-sub">Play Quick play or a category quiz to start building your word list.</p>
          <button className="big-btn" onClick={onBack}>Start playing</button>
        </div>
      ) : (
        <>
          <div className="mw-stats">
            <div className="mw-stat">
              <span className="mw-stat-num">{touchedWords.length}</span>
              <span className="mw-stat-lbl">seen</span>
            </div>
            <div className="mw-stat-div" />
            <div className="mw-stat">
              <span className="mw-stat-num mw-num-green">{mastered}</span>
              <span className="mw-stat-lbl">mastered</span>
            </div>
            <div className="mw-stat-div" />
            <div className="mw-stat">
              <span className="mw-stat-num mw-num-amber">{inProgress}</span>
              <span className="mw-stat-lbl">in progress</span>
            </div>
          </div>

          <div className="mw-filters">
            <div className="mw-filter-row">
              {FILTERS.map(({ key, label }) => (
                <button
                  key={key}
                  className={`mw-filter-btn${filter === key ? ' mw-filter-on' : ''}`}
                  onClick={() => setFilter(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="mw-level-row">
              {LEVELS.map((lvl) => (
                <button
                  key={lvl}
                  className={`mw-lvl-btn level-${lvl}${activeLevels.has(lvl) ? ' mw-lvl-on' : ' mw-lvl-off'}`}
                  onClick={() => toggleLevel(lvl)}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          <p className="mw-count">{filteredWords.length} word{filteredWords.length !== 1 ? 's' : ''}</p>

          <div className="mw-grid">
            {filteredWords.map((w) => {
              const learned = isLearned(progress[w.id])
              return (
                <div key={w.id} className={`mw-card${learned ? ' mw-card-done' : ''}`}>
                  <img
                    className="mw-card-img"
                    src={`${import.meta.env.BASE_URL}images/${w.image}`}
                    alt=""
                    onError={(e) => { e.currentTarget.style.display = 'none' }}
                  />
                  <div className="mw-card-body">
                    <span className="mw-card-es">{w.es}</span>
                    <span className="mw-card-en">{w.en}</span>
                  </div>
                  <div className="mw-card-foot">
                    <span className={`level-badge level-${w.level || 'A'}`}>{w.level || 'A'}</span>
                    <button className="mw-speak" onClick={(e) => { e.stopPropagation(); speak(w.es) }}>🔊</button>
                    {learned && <span className="mw-check">✓</span>}
                  </div>
                </div>
              )
            })}
          </div>

          {filteredWords.length > 0 && (
            <div className="mw-quiz-wrap">
              <button className="big-btn" onClick={() => onQuiz(filteredWords)}>
                Quiz these ({filteredWords.length})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
