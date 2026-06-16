import { useState } from 'react'
import { markGrammarDone } from '../lib/grammarProgress.js'

function GrammarSection({ section }) {
  if (section.type === 'rule') {
    return (
      <div className="gs-rule">
        {section.title && <h3 className="gs-rule-title">{section.title}</h3>}
        <p className="gs-rule-content">{section.content}</p>
      </div>
    )
  }
  if (section.type === 'table') {
    return (
      <div className="gs-table-wrap">
        {section.title && <h3 className="gs-section-title">{section.title}</h3>}
        <div className="gs-table-scroll">
          <table className="gs-table">
            <thead>
              <tr>{section.headers.map((h, i) => <th key={i}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {section.rows.map((row, i) => (
                <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }
  if (section.type === 'examples') {
    return (
      <div className="gs-examples">
        {section.title && <h3 className="gs-section-title">{section.title}</h3>}
        {section.items.map((item, i) => (
          <div key={i} className="gs-example">
            <span className="gs-example-es">{item.es}</span>
            <span className="gs-example-en">{item.en}</span>
            {item.note && <span className="gs-example-note">{item.note}</span>}
          </div>
        ))}
      </div>
    )
  }
  if (section.type === 'note') {
    return (
      <div className="gs-note">
        <span className="gs-note-label">{section.label}</span>
        <p className="gs-note-content">{section.content}</p>
      </div>
    )
  }
  return null
}

function GrammarQuestion({ question, onNext, isLast }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  function pick(option, idx) {
    if (answered) return
    setSelected(question.type === 'choose' ? idx : option)
    setAnswered(true)
  }

  const isCorrect = (option, idx) => {
    if (question.type === 'choose') return idx === question.correct
    return option === question.correct
  }

  const wasSelected = (option, idx) => {
    if (question.type === 'choose') return selected === idx
    return selected === option
  }

  function optionClass(option, idx) {
    if (!answered) return 'option'
    if (isCorrect(option, idx)) return 'option correct'
    if (wasSelected(option, idx)) return 'option wrong'
    return 'option'
  }

  const userWasCorrect = answered && (
    question.type === 'choose'
      ? selected === question.correct
      : selected === question.correct
  )

  const parts = question.prompt.includes('___')
    ? question.prompt.split('___')
    : null

  return (
    <div className="gq-wrap">
      <div className="gq-prompt">
        {parts ? (
          <p className="gq-sentence">
            {parts[0]}
            <span className="gq-blank">{answered ? question.correct : '___'}</span>
            {parts[1]}
          </p>
        ) : (
          <p className="gq-text">{question.prompt}</p>
        )}
      </div>

      <div className="gq-options">
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={optionClass(opt, i)}
            onClick={() => pick(opt, i)}
            disabled={answered}
          >
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <div className={`gq-feedback ${userWasCorrect ? 'gq-feedback-correct' : 'gq-feedback-wrong'}`}>
          <span className="gq-feedback-icon">{userWasCorrect ? '✓' : '✗'}</span>
          <p className="gq-explanation">{question.explanation}</p>
        </div>
      )}

      {answered && (
        <button className="big-btn" onClick={onNext}>
          {isLast ? 'See results' : 'Next →'}
        </button>
      )}
    </div>
  )
}

export default function GrammarLesson({ topic, onBack }) {
  const [phase, setPhase] = useState('learn') // 'learn' | 'practice' | 'done'
  const [qIdx, setQIdx] = useState(0)
  const [score, setScore] = useState(0)

  function handleNext(wasCorrect) {
    const newScore = score + (wasCorrect ? 1 : 0)
    if (qIdx + 1 < topic.questions.length) {
      setScore(newScore)
      setQIdx(qIdx + 1)
    } else {
      setScore(newScore)
      markGrammarDone(topic.id, newScore, topic.questions.length)
      setPhase('done')
    }
  }

  function startOver() {
    setQIdx(0)
    setScore(0)
    setPhase('practice')
  }

  if (phase === 'learn') {
    return (
      <div className="grammar-lesson">
        <div className="screen-bar">
          <button className="link" onClick={onBack}>← Back</button>
          <span className="screen-bar-title">{topic.title}</span>
          <span />
        </div>

        <div className="gl-header">
          <span className="gl-icon">{topic.icon}</span>
          <div>
            <h1 className="gl-title">{topic.title}</h1>
            <p className="gl-titlees">{topic.titleEs}</p>
          </div>
        </div>

        <p className="gl-intro">{topic.intro}</p>

        {topic.sections.map((section, i) => (
          <GrammarSection key={i} section={section} />
        ))}

        <div className="gl-start-wrap">
          <button className="big-btn" onClick={() => setPhase('practice')}>
            ✏️ Start practice — {topic.questions.length} questions
          </button>
        </div>
      </div>
    )
  }

  if (phase === 'practice') {
    const q = topic.questions[qIdx]
    const total = topic.questions.length

    // We need per-question state, so GrammarQuestion manages its own selected state
    // But we need to know if the answer was correct when user clicks Next
    // Solution: pass a callback that includes wasCorrect
    return (
      <div className="grammar-practice">
        <div className="screen-bar">
          <button className="link" onClick={onBack}>← Back</button>
          <span className="screen-bar-title">{topic.title}</span>
          <span className="screen-bar-right">{qIdx + 1}/{total}</span>
        </div>

        <div className="gp-progress-bar">
          <div className="gp-progress-fill" style={{ width: `${(qIdx / total) * 100}%` }} />
        </div>

        <GrammarQuestionControlled
          key={qIdx}
          question={q}
          isLast={qIdx + 1 === total}
          onNext={(wasCorrect) => handleNext(wasCorrect)}
        />
      </div>
    )
  }

  // done phase
  const total = topic.questions.length
  const perfect = score === total
  const message =
    score === total ? '¡Perfecto! All correct!' :
    score >= total * 0.75 ? '¡Excelente! Great work!' :
    score >= total * 0.5 ? '¡Buen intento! Keep going!' :
    'Keep practising — you\'ll get there!'

  return (
    <div className="grammar-done">
      <div className="screen-bar">
        <button className="link" onClick={onBack}>← Back</button>
      </div>

      <div className="gd-content">
        <span className="gd-badge">{perfect ? '⭐' : '✓'}</span>
        <h2 className="gd-score">{score}/{total}</h2>
        <p className="gd-message">{message}</p>

        <div className="gd-actions">
          {!perfect && (
            <button className="big-btn-outline" onClick={startOver}>
              Try again
            </button>
          )}
          <button className="big-btn" onClick={onBack}>
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

// Controlled version that passes wasCorrect to parent
function GrammarQuestionControlled({ question, onNext, isLast }) {
  const [selected, setSelected] = useState(null)
  const [answered, setAnswered] = useState(false)

  function pick(option, idx) {
    if (answered) return
    const val = question.type === 'choose' ? idx : option
    setSelected(val)
    setAnswered(true)
  }

  const isCorrect = (option, idx) => {
    if (question.type === 'choose') return idx === question.correct
    return option === question.correct
  }

  const wasSelected = (option, idx) => {
    if (question.type === 'choose') return selected === idx
    return selected === option
  }

  function optionClass(option, idx) {
    if (!answered) return 'option'
    if (isCorrect(option, idx)) return 'option correct'
    if (wasSelected(option, idx)) return 'option wrong'
    return 'option'
  }

  const userWasCorrect = answered && (
    question.type === 'choose'
      ? selected === question.correct
      : selected === question.correct
  )

  const parts = question.prompt.includes('___')
    ? question.prompt.split('___')
    : null

  return (
    <div className="gq-wrap">
      <div className="gq-prompt">
        {parts ? (
          <p className="gq-sentence">
            {parts[0]}
            <span className="gq-blank">{answered ? question.correct : '___'}</span>
            {parts[1]}
          </p>
        ) : (
          <p className="gq-text">{question.prompt}</p>
        )}
      </div>

      <div className={`gq-options ${question.options.length === 2 ? 'gq-options-2' : ''}`}>
        {question.options.map((opt, i) => (
          <button
            key={i}
            className={optionClass(opt, i)}
            onClick={() => pick(opt, i)}
            disabled={answered}
          >
            {opt}
          </button>
        ))}
      </div>

      {answered && (
        <div className={`gq-feedback ${userWasCorrect ? 'gq-feedback-correct' : 'gq-feedback-wrong'}`}>
          <span className="gq-feedback-icon">{userWasCorrect ? '✓' : '✗'}</span>
          <p className="gq-explanation">{question.explanation}</p>
        </div>
      )}

      {answered && (
        <button className="big-btn" onClick={() => onNext(userWasCorrect)}>
          {isLast ? 'See results' : 'Next →'}
        </button>
      )}
    </div>
  )
}
