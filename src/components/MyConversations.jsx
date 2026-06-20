import { useState, useMemo } from 'react'
import conversations, { levels } from '../data/conversations/index.js'
import { loadConvProgress } from '../lib/convProgress.js'

function ConvDetail({ conv, onBack }) {
  return (
    <div className="review-screen">
      <div className="screen-bar">
        <button className="link" onClick={onBack}>← Back</button>
        <span className="screen-bar-title">{conv.title}</span>
        <span />
      </div>
      <p className="review-scene">{conv.scene}</p>
      <div className="review-dialogue">
        {conv.lines.map((line, i) => (
          <div key={i} className="review-line">
            <span className="review-speaker">Speaker {line.speaker}</span>
            <p className="review-es">{line.es}</p>
            <p className="review-en">{line.en}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MyConversations({ onBack }) {
  const [selected, setSelected] = useState(null)
  const progress = useMemo(() => loadConvProgress(), [])

  const byLevel = useMemo(() => {
    const map = {}
    for (const conv of conversations) {
      if (!map[conv.level]) map[conv.level] = []
      map[conv.level].push(conv)
    }
    return map
  }, [])

  if (selected) {
    return <ConvDetail conv={selected} onBack={() => setSelected(null)} />
  }

  const levelNums = Object.keys(byLevel).map(Number).sort()
  const doneCount = conversations.filter((c) => progress[c.id]?.done).length

  return (
    <div className="review-screen">
      <div className="screen-bar">
        <button className="link" onClick={onBack}>← Back</button>
        <span className="screen-bar-title">My Conversations</span>
        <span />
      </div>

      <p className="review-sub">
        {doneCount}/{conversations.length} completed — tap to read the full dialogue
      </p>

      {levelNums.map((lvl) => (
        <div key={lvl} className="review-group">
          <div className="review-group-header">
            <span className="conv-level-badge">Level {lvl}</span>
            <span className="review-group-desc">{levels[lvl]?.description}</span>
          </div>
          {byLevel[lvl].map((conv) => {
            const p = progress[conv.id]
            const done = p?.done
            return (
              <button
                key={conv.id}
                className={`review-item${done ? '' : ' review-item-locked'}`}
                onClick={() => done && setSelected(conv)}
                disabled={!done}
              >
                <div className="review-item-body">
                  <span className="review-item-title">{conv.title}</span>
                  <span className="review-item-sub">{conv.lines.length} lines · {conv.scene}</span>
                </div>
                <span className="review-item-right">
                  {p?.perfect ? '⭐' : done ? '✓' : '🔒'}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
