import { useMemo } from 'react'
import conversations, { levels } from '../data/conversations/index.js'
import { loadConvProgress } from '../lib/convProgress.js'

export default function Conversations({ onStart, onBack, onMyConversations }) {
  const progress = useMemo(() => loadConvProgress(), [])

  const byLevel = useMemo(() => {
    const map = {}
    for (const conv of conversations) {
      if (!map[conv.level]) map[conv.level] = []
      map[conv.level].push(conv)
    }
    return map
  }, [])

  const levelNums = Object.keys(byLevel).map(Number).sort()

  return (
    <div className="conv-list-screen">
      <div className="conv-list-bar">
        <button className="link" onClick={onBack}>← Back</button>
        <h2 className="conv-list-title">Conversations</h2>
        <button className="link review-link" onClick={onMyConversations}>📖 Mine</button>
      </div>

      <p className="conv-list-sub">
        Read the English line, then tap tiles to build the Spanish sentence.
      </p>

      {levelNums.map((lvl) => (
        <div key={lvl} className="conv-level-section">
          <div className="conv-level-header">
            <span className="conv-level-badge">Level {lvl}</span>
            <span className="conv-level-desc">{levels[lvl]?.description}</span>
          </div>

          <div className="conv-cards">
            {byLevel[lvl].map((conv) => {
              const p = progress[conv.id]
              return (
                <button
                  key={conv.id}
                  className={`conv-card ${p?.done ? 'conv-card-done' : ''}`}
                  onClick={() => onStart(conv)}
                >
                  <div className="conv-card-left">
                    <span className="conv-card-title">{conv.title}</span>
                    <span className="conv-card-scene">{conv.scene}</span>
                    <span className="conv-card-lines">{conv.lines.length} lines</span>
                  </div>
                  <div className="conv-card-right">
                    {p?.perfect && <span className="conv-star" title="Perfect!">⭐</span>}
                    {p?.done && !p?.perfect && <span className="conv-check">✓</span>}
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
