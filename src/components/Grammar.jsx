import { useMemo } from 'react'
import grammarTopics, { groups } from '../data/grammar/index.js'
import { loadGrammarProgress } from '../lib/grammarProgress.js'

export default function Grammar({ onStart, onBack, onMyGrammar }) {
  const progress = useMemo(() => loadGrammarProgress(), [])

  const byGroup = useMemo(() => {
    const map = {}
    for (const topic of grammarTopics) {
      if (!map[topic.group]) map[topic.group] = []
      map[topic.group].push(topic)
    }
    return map
  }, [])

  const groupKeys = Object.keys(byGroup).sort()

  return (
    <div className="grammar-screen">
      <div className="screen-bar">
        <button className="link" onClick={onBack}>← Back</button>
        <h2 className="screen-bar-title">Grammar</h2>
        <button className="link review-link" onClick={onMyGrammar}>📖 Mine</button>
      </div>

      <p className="screen-sub">Learn the rules, then practise with questions.</p>

      {groupKeys.map((g) => (
        <div key={g} className="grammar-group">
          <div className="grammar-group-header">
            <span className="grammar-group-label">Group {g}</span>
            <span className="grammar-group-desc">{groups[g]?.name}</span>
          </div>
          <p className="grammar-group-sub">{groups[g]?.description}</p>

          <div className="grammar-topic-list">
            {byGroup[g].map((topic) => {
              const p = progress[topic.id]
              return (
                <button
                  key={topic.id}
                  className={`grammar-topic-card ${p?.done ? 'grammar-topic-done' : ''}`}
                  onClick={() => onStart(topic)}
                >
                  <span className="grammar-topic-icon">{topic.icon}</span>
                  <div className="grammar-topic-body">
                    <span className="grammar-topic-title">{topic.title}</span>
                    <span className="grammar-topic-sub">{topic.titleEs} · {topic.questions.length} questions</span>
                  </div>
                  <span className="grammar-topic-badge">
                    {p?.perfect ? '⭐' : p?.done ? '✓' : '›'}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
