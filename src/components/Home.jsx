import { useMemo, useState } from 'react'
import { allWords } from '../data/index.js'
import { loadProgress, loadStreak, stats, isLearned, isDue } from '../lib/progress.js'
import { loadConvProgress } from '../lib/convProgress.js'
import { loadGrammarProgress } from '../lib/grammarProgress.js'
import { getWordOfDay } from '../lib/wordOfDay.js'
import { speak } from '../lib/speech.js'
import conversations from '../data/conversations/index.js'
import grammarTopics from '../data/grammar/index.js'

export default function Home({
  categories, onStartMixed, onStartCategory, onStartReview, onStartSearch,
  onConversations, onGrammar, onMyWords,
  quickLevels, onToggleQuickLevel, recallMode, onToggleRecall,
}) {
  const [search, setSearch] = useState('')
  const progress = useMemo(() => loadProgress(), [])
  const s = useMemo(() => stats(progress), [progress])
  const streak = useMemo(() => loadStreak(), [])
  const convProgress = useMemo(() => loadConvProgress(), [])
  const grammarProgress = useMemo(() => loadGrammarProgress(), [])

  const convDone = Object.values(convProgress).filter((p) => p.done).length
  const grammarDone = Object.values(grammarProgress).filter((p) => p.done).length
  const dueCount = useMemo(() => allWords.filter((w) => isDue(progress[w.id])).length, [progress])

  const wotd = useMemo(() => getWordOfDay(), [])
  const wotdCat = useMemo(() => categories.find((c) => c.id === wotd.categoryId), [categories, wotd])

  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return []
    return allWords
      .filter((w) => w.es.toLowerCase().includes(q) || w.en.toLowerCase().includes(q))
      .slice(0, 24)
  }, [search])

  return (
    <div className="home">
      <div className="hero-band">
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

        <div className="hero-stripe" />
      </div>

      <div className="home-body">
        {/* Search bar */}
        <div className="search-wrap">
          <span className="search-icon">🔍</span>
          <input
            className="search-input"
            type="search"
            placeholder="Search words in Spanish or English…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="search-clear" onClick={() => setSearch('')}>✕</button>
          )}
        </div>

        {search ? (
          /* Search results */
          <div className="search-results">
            {searchResults.length === 0 ? (
              <p className="search-empty">No words found for "{search}"</p>
            ) : (
              <>
                <p className="search-count">{searchResults.length} result{searchResults.length !== 1 ? 's' : ''} — tap to quiz</p>
                <button className="search-quiz-all big-btn" onClick={() => { onStartSearch(searchResults); setSearch('') }}>
                  Quiz all {searchResults.length} results
                </button>
                <div className="search-list">
                  {searchResults.map((w) => (
                    <div key={w.id} className="search-item">
                      <img
                        className="search-item-img"
                        src={`${import.meta.env.BASE_URL}images/${w.image}`}
                        alt=""
                        onError={(e) => { e.currentTarget.style.display = 'none' }}
                      />
                      <div className="search-item-body">
                        <span className="search-item-es">{w.es}</span>
                        <span className="search-item-en">{w.en}</span>
                        <span className="search-item-cat">{w.categoryName}</span>
                      </div>
                      <button className="search-item-speak" onClick={() => speak(w.es)}>🔊</button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        ) : (
          <>
            {/* Word of the Day */}
            <div className="wotd-card" onClick={() => wotdCat && onStartCategory(wotdCat)}>
              <div className="wotd-left">
                <span className="wotd-label">Word of the day</span>
                <span className="wotd-es">{wotd.es}</span>
                <span className="wotd-en">{wotd.en}</span>
              </div>
              <img
                className="wotd-img"
                src={`${import.meta.env.BASE_URL}images/${wotd.image}`}
                alt=""
                onError={(e) => { e.currentTarget.style.display = 'none' }}
              />
              <button
                className="wotd-speak"
                onClick={(e) => { e.stopPropagation(); speak(wotd.es) }}
                title="Hear pronunciation"
              >
                🔊
              </button>
            </div>

            {/* Mode cards */}
            <div className="mode-cards">
              {/* Review due — only shown if there are due words */}
              {dueCount > 0 && (
                <button className="mode-card mode-card-review" onClick={onStartReview}>
                  <div className="mode-icon-circle mic-teal">🔁</div>
                  <div className="mode-card-body">
                    <span className="mode-card-title">Review due</span>
                    <span className="mode-card-desc">{dueCount} word{dueCount !== 1 ? 's' : ''} ready to review</span>
                  </div>
                  <span className="mode-card-arr">›</span>
                </button>
              )}

              {/* Quick play */}
              <div className="mode-card mode-card-primary mode-card-qp">
                <button className="mode-card-qp-main" onClick={onStartMixed}>
                  <div className="mode-icon-circle mic-blue">⚡</div>
                  <div className="mode-card-body">
                    <span className="mode-card-title">Quick play</span>
                    <span className="mode-card-desc">
                      {s.studied > 0 ? `${s.learned} learned · ` : ''}
                      {categories.reduce((n, c) => n + c.words.filter(w => quickLevels.has(w.level || 'A')).length, 0)} words
                    </span>
                  </div>
                  <span className="mode-card-arr">›</span>
                </button>
                <div className="qp-level-row">
                  {['A', 'B', 'C'].map((lvl) => (
                    <button
                      key={lvl}
                      className={`qp-lvl-btn level-${lvl}${quickLevels.has(lvl) ? ' qp-lvl-on' : ' qp-lvl-off'}`}
                      onClick={(e) => { e.stopPropagation(); onToggleQuickLevel(lvl) }}
                    >
                      {lvl}
                    </button>
                  ))}
                  <span className="qp-lvl-hint">level filter</span>
                  <button
                    className={`qp-recall-btn${recallMode ? ' qp-recall-on' : ''}`}
                    onClick={(e) => { e.stopPropagation(); onToggleRecall() }}
                  >
                    🔄 Recall
                  </button>
                </div>
              </div>

              <button className="mode-card" onClick={onConversations}>
                <div className="mode-icon-circle mic-red">💬</div>
                <div className="mode-card-body">
                  <span className="mode-card-title">Conversations</span>
                  <span className="mode-card-desc">{conversations.length} dialogues{convDone > 0 ? ` · ${convDone} done` : ''}</span>
                </div>
                <span className="mode-card-arr">›</span>
              </button>

              <button className="mode-card" onClick={onGrammar}>
                <div className="mode-icon-circle mic-yellow">📘</div>
                <div className="mode-card-body">
                  <span className="mode-card-title">Grammar</span>
                  <span className="mode-card-desc">{grammarTopics.length} topics{grammarDone > 0 ? ` · ${grammarDone} done` : ''}</span>
                </div>
                <span className="mode-card-arr">›</span>
              </button>

              <button className="mode-card" onClick={onMyWords}>
                <div className="mode-icon-circle mic-green">📖</div>
                <div className="mode-card-body">
                  <span className="mode-card-title">My Words</span>
                  <span className="mode-card-desc">{s.studied > 0 ? `${s.studied} seen · ${s.learned} mastered` : 'review words you\'ve studied'}</span>
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
                const done = learned === total && total > 0
                return (
                  <button key={cat.id} className={`cat-card${done ? ' cat-card-done' : ''}`} onClick={() => onStartCategory(cat)}>
                    {cat.emoji && <span className="cat-emoji">{cat.emoji}</span>}
                    <span className="cat-name">{cat.name}</span>
                    <span className="cat-name-es">{cat.nameEs}</span>
                    <div className="cat-prog-bar">
                      <div className="cat-prog-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="cat-prog">{done ? '✓ Complete' : `${learned}/${total}`}</span>
                  </button>
                )
              })}
            </div>

            <p className="footnote">Works fully offline · progress saved on this device</p>
          </>
        )}
      </div>
    </div>
  )
}
