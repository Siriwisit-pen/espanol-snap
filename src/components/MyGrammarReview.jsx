import { useState, useMemo } from 'react'
import grammarTopics, { groups } from '../data/grammar/index.js'
import { loadGrammarProgress } from '../lib/grammarProgress.js'

function GrammarDetail({ topic, onBack }) {
  const recapSections = topic.sections.filter((s) => s.type === 'rule' || s.type === 'note')

  return (
    <div className="review-screen">
      <div className="screen-bar">
        <button className="link" onClick={onBack}>← Back</button>
        <span className="screen-bar-title">{topic.title}</span>
        <span />
      </div>

      <div className="review-grammar-header">
        <span className="review-grammar-icon">{topic.icon}</span>
        <div>
          <h2 className="review-grammar-title">{topic.title}</h2>
          <p className="review-grammar-titlees">{topic.titleEs}</p>
        </div>
      </div>

      <p className="review-grammar-intro">{topic.intro}</p>

      <div className="review-grammar-recap">
        {recapSections.map((section, i) => (
          <div key={i} className={`gd-recap-item${section.type === 'note' ? ' gd-recap-item-note' : ''}`}>
            {section.type === 'rule' && (
              <>
                {section.title && <p className="gd-recap-label">{section.title}</p>}
                <p className="gd-recap-text">{section.content}</p>
              </>
            )}
            {section.type === 'note' && (
              <>
                <p className="gd-recap-label">💡 {section.label}</p>
                <p className="gd-recap-text">{section.content}</p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function MyGrammarReview({ onBack }) {
  const [selected, setSelected] = useState(null)
  const progress = useMemo(() => loadGrammarProgress(), [])

  const byGroup = useMemo(() => {
    const map = {}
    for (const topic of grammarTopics) {
      if (!map[topic.group]) map[topic.group] = []
      map[topic.group].push(topic)
    }
    return map
  }, [])

  if (selected) {
    return <GrammarDetail topic={selected} onBack={() => setSelected(null)} />
  }

  const groupKeys = Object.keys(byGroup).sort()
  const doneCount = grammarTopics.filter((t) => progress[t.id]?.done).length

  return (
    <div className="review-screen">
      <div className="screen-bar">
        <button className="link" onClick={onBack}>← Back</button>
        <span className="screen-bar-title">My Grammar</span>
        <span />
      </div>

      <p className="review-sub">
        {doneCount}/{grammarTopics.length} completed — tap to review the rules
      </p>

      {groupKeys.map((g) => (
        <div key={g} className="review-group">
          <div className="review-group-header">
            <span className="grammar-group-label">Group {g}</span>
            <span className="review-group-desc">{groups[g]?.name}</span>
          </div>
          {byGroup[g].map((topic) => {
            const p = progress[topic.id]
            const done = p?.done
            return (
              <button
                key={topic.id}
                className={`review-item${done ? '' : ' review-item-locked'}`}
                onClick={() => done && setSelected(topic)}
                disabled={!done}
              >
                <span className="review-item-icon">{topic.icon}</span>
                <div className="review-item-body">
                  <span className="review-item-title">{topic.title}</span>
                  <span className="review-item-sub">{topic.titleEs}</span>
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
