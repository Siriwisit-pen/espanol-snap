import { useEffect, useState } from 'react'
import { wordsByCategory } from '../data/index.js'
import { buildOptions, pickWord } from '../lib/quiz.js'
import { loadProgress, recordAnswer, touchStreak } from '../lib/progress.js'

function WordImage({ image }) {
  const [err, setErr] = useState(false)
  useEffect(() => {
    setErr(false)
  }, [image])

  if (err || !image) {
    // Until photos are fetched (or if one is missing), show a neutral placeholder.
    // alt is intentionally empty so it never reveals the answer.
    return (
      <div className="word-img placeholder">
        <span className="ph-emoji">📷</span>
        <span className="ph-text">photo coming soon</span>
      </div>
    )
  }
  return (
    <img
      className="word-img"
      src={`${import.meta.env.BASE_URL}images/${image}`}
      alt=""
      onError={() => setErr(true)}
    />
  )
}

export default function Quiz({ pool, title, onExit }) {
  const [progress, setProgress] = useState(loadProgress)
  const [question, setQuestion] = useState(null)
  const [wrongPicks, setWrongPicks] = useState([])
  const [solved, setSolved] = useState(false) // got it right this card
  const [recorded, setRecorded] = useState(false) // first-attempt result saved
  const [showHint, setShowHint] = useState(false)
  const [seen, setSeen] = useState(0)
  const [correct, setCorrect] = useState(0)

  function next(prog = progress) {
    const avoid = question?.word.id ?? null
    const word = pickWord(pool, prog, avoid)
    const catWords = wordsByCategory[word.categoryId] || pool
    setQuestion({ word, options: buildOptions(word, catWords) })
    setWrongPicks([])
    setSolved(false)
    setRecorded(false)
    setShowHint(false)
  }

  // Start the first question once, when the component mounts.
  useEffect(() => {
    touchStreak()
    next()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!question) return null
  const { word, options } = question

  function choose(opt) {
    if (solved || wrongPicks.includes(opt.id)) return
    const isCorrect = opt.id === word.id

    // Only the first attempt counts toward progress/score.
    if (!recorded) {
      const prog = recordAnswer(word.id, isCorrect)
      setProgress(prog)
      setRecorded(true)
      setSeen((n) => n + 1)
      if (isCorrect) setCorrect((n) => n + 1)
    }

    if (isCorrect) {
      setSolved(true)
      setTimeout(() => next(), 750)
    } else {
      setWrongPicks((w) => [...w, opt.id])
    }
  }

  return (
    <div className="quiz">
      <header className="quiz-bar">
        <button className="link" onClick={onExit}>
          ← Back
        </button>
        <span className="quiz-title">{title}</span>
        <span className="quiz-score">
          {correct}/{seen}
        </span>
      </header>

      <div className="quiz-body">
        <WordImage image={word.image} />

        <div className="options">
          {options.map((opt) => {
            let cls = 'option'
            if (solved && opt.id === word.id) cls += ' correct'
            if (wrongPicks.includes(opt.id)) cls += ' wrong'
            const disabled = solved || wrongPicks.includes(opt.id)
            return (
              <button key={opt.id} className={cls} disabled={disabled} onClick={() => choose(opt)}>
                {opt.es}
              </button>
            )
          })}
        </div>

        <div className="hint-area">
          {showHint ? (
            <p className="hint">{word.hint}</p>
          ) : (
            <button className="hint-btn" onClick={() => setShowHint(true)}>
              💡 Hint
            </button>
          )}
        </div>
      </div>

      <footer className="quiz-foot">
        {!solved && (
          <button className="skip" onClick={() => next()}>
            Skip →
          </button>
        )}
      </footer>
    </div>
  )
}
