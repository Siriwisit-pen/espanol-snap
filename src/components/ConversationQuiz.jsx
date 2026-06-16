import { useState, useEffect, useCallback } from 'react'
import { markConvDone } from '../lib/convProgress.js'

function shuffle(arr) {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeTiles(tiles, lineIdx) {
  return tiles.map((text, i) => ({ id: `${lineIdx}-${i}`, text }))
}

export default function ConversationQuiz({ conv, onBack }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [phase, setPhase] = useState('building') // building | correct | wrong | done
  const [placed, setPlaced] = useState([])
  const [available, setAvailable] = useState([])
  const [hasMistake, setHasMistake] = useState(false)
  const [mistakeOnLine, setMistakeOnLine] = useState(false)
  const [showMeanings, setShowMeanings] = useState(false)
  const [wrongFlash, setWrongFlash] = useState(false)

  const line = conv.lines[lineIndex]

  const startLine = useCallback((idx) => {
    const l = conv.lines[idx]
    setLineIndex(idx)
    setPlaced([])
    setAvailable(shuffle(makeTiles(l.tiles, idx)))
    setPhase('building')
    setMistakeOnLine(false)
    setShowMeanings(false)
    setWrongFlash(false)
  }, [conv])

  useEffect(() => {
    startLine(0)
  }, [startLine])

  function placeTile(tile) {
    if (phase !== 'building') return
    const newPlaced = [...placed, tile]
    const newAvailable = available.filter((t) => t.id !== tile.id)
    setPlaced(newPlaced)
    setAvailable(newAvailable)

    if (newAvailable.length === 0) {
      const answer = newPlaced.map((t) => t.text).join(' ')
      if (answer === line.es) {
        setPhase('correct')
        if (!mistakeOnLine && !hasMistake) {
          // still clean so far
        }
      } else {
        setHasMistake(true)
        setMistakeOnLine(true)
        setPhase('wrong')
        setWrongFlash(true)
        setTimeout(() => {
          setWrongFlash(false)
          setPlaced([])
          setAvailable(shuffle(makeTiles(line.tiles, lineIndex)))
          setPhase('building')
        }, 900)
      }
    }
  }

  function unplaceTile(tile) {
    if (phase !== 'building') return
    setPlaced((prev) => prev.filter((t) => t.id !== tile.id))
    setAvailable((prev) => [...prev, tile])
  }

  function advance() {
    if (lineIndex + 1 < conv.lines.length) {
      startLine(lineIndex + 1)
    } else {
      markConvDone(conv.id, !hasMistake && !mistakeOnLine)
      setPhase('done')
    }
  }

  if (phase === 'done') {
    const perfect = !hasMistake
    return (
      <div className="conv-quiz">
        <div className="conv-quiz-bar">
          <button className="link" onClick={onBack}>← Back</button>
        </div>
        <div className="conv-done">
          <div className="conv-done-badge">{perfect ? '⭐' : '✓'}</div>
          <h2 className="conv-done-title">{perfect ? '¡Perfecto!' : '¡Bien hecho!'}</h2>
          <p className="conv-done-sub">
            {perfect ? 'No mistakes — great work!' : 'Completed! Keep practising for a perfect score.'}
          </p>
          <div className="conv-recap">
            {conv.lines.map((l, i) => (
              <div key={i} className="conv-recap-line">
                <span className="conv-recap-speaker">{l.speaker}</span>
                <div className="conv-recap-text">
                  <span className="conv-recap-es">{l.es}</span>
                  <span className="conv-recap-en">{l.en}</span>
                </div>
              </div>
            ))}
          </div>
          <button className="big-btn" onClick={onBack}>Done</button>
        </div>
      </div>
    )
  }

  return (
    <div className="conv-quiz">
      <div className="conv-quiz-bar">
        <button className="link" onClick={onBack}>← Back</button>
        <span className="conv-quiz-title">{conv.title}</span>
        <span className="conv-quiz-prog">{lineIndex + 1}/{conv.lines.length}</span>
      </div>

      <img
        className="conv-scene-img"
        src={`${import.meta.env.BASE_URL}images/${conv.image}`}
        alt={conv.title}
      />

      <div className="conv-line-dots">
        {conv.lines.map((_, i) => (
          <span
            key={i}
            className={`conv-dot ${i < lineIndex ? 'conv-dot-done' : i === lineIndex ? 'conv-dot-active' : ''}`}
          />
        ))}
      </div>

      <div className="conv-line-card">
        <span className="conv-speaker-tag">Speaker {line.speaker}</span>
        <p className="conv-line-en">{line.en}</p>
      </div>

      <div className={`conv-placed-area ${wrongFlash ? 'conv-placed-wrong' : ''} ${phase === 'correct' ? 'conv-placed-correct' : ''}`}>
        {placed.length === 0 && (
          <span className="conv-placed-hint">Tap words below to build the sentence</span>
        )}
        {placed.map((tile) => (
          <button
            key={tile.id}
            className="tile tile-placed"
            onClick={() => unplaceTile(tile)}
            disabled={phase !== 'building'}
          >
            {tile.text}
          </button>
        ))}
      </div>

      {phase === 'correct' && (
        <div className="conv-feedback conv-feedback-correct">
          <div className="conv-feedback-row">
            <span className="conv-feedback-icon">✓</span>
            <div>
              <p className="conv-feedback-es">{line.es}</p>
              <p className="conv-feedback-en">{line.en}</p>
            </div>
          </div>
          <div className="conv-breakdown">
            {line.breakdown.map((b, i) => (
              <div key={i} className="conv-breakdown-row">
                <span className="conv-breakdown-word">{b.word}</span>
                <span className="conv-breakdown-arrow">→</span>
                <span className="conv-breakdown-meaning">{b.meaning}</span>
              </div>
            ))}
          </div>
          <button className="big-btn" onClick={advance}>
            {lineIndex + 1 < conv.lines.length ? 'Next line →' : 'Finish'}
          </button>
        </div>
      )}

      {phase !== 'correct' && (
        <div className="conv-available">
          <div className="conv-available-header">
            <span className="conv-available-label">Word bank</span>
            <button
              className="conv-meanings-btn"
              onClick={() => setShowMeanings((v) => !v)}
            >
              {showMeanings ? 'Hide meanings' : '💡 Show meanings'}
            </button>
          </div>
          <div className="conv-tiles">
            {available.map((tile) => (
              <button
                key={tile.id}
                className="tile tile-available"
                onClick={() => placeTile(tile)}
                disabled={phase === 'wrong'}
              >
                <span className="tile-text">{tile.text}</span>
                {showMeanings && line.tileMeanings?.[tile.text] && (
                  <span className="tile-meaning">{line.tileMeanings[tile.text]}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
