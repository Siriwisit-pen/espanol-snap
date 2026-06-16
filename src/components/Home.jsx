import { loadProgress, loadStreak, stats, isLearned } from '../lib/progress.js'

export default function Home({ categories, onStartMixed, onStartCategory, onConversations }) {
  const progress = loadProgress()
  const s = stats(progress)
  const streak = loadStreak()

  return (
    <div className="home">
      <header className="home-head">
        <h1>Español&nbsp;Snap</h1>
        <p className="tag">Learn Spanish, one picture at a time.</p>
      </header>

      <div className="stats">
        <div className="stat">
          <span className="num">{streak.count}</span>
          <span className="lbl">day streak</span>
        </div>
        <div className="stat">
          <span className="num">{s.learned}</span>
          <span className="lbl">learned</span>
        </div>
        <div className="stat">
          <span className="num">{s.studied}</span>
          <span className="lbl">seen</span>
        </div>
      </div>

      <button className="big-btn" onClick={onStartMixed}>
        ▶&nbsp; Quick play
      </button>

      <button className="conv-home-btn" onClick={onConversations}>
        💬&nbsp; Conversations
      </button>

      <h2 className="section">Categories</h2>
      <div className="cat-grid">
        {categories.map((cat) => {
          const total = cat.words.length
          const learned = cat.words.filter((w) => isLearned(progress[w.id])).length
          return (
            <button key={cat.id} className="cat-card" onClick={() => onStartCategory(cat)}>
              <span className="cat-name">{cat.name}</span>
              <span className="cat-name-es">{cat.nameEs}</span>
              <span className="cat-prog">
                {learned}/{total}
              </span>
            </button>
          )
        })}
      </div>

      <p className="footnote">Works offline · your progress stays on this device</p>
    </div>
  )
}
