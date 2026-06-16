import { useState } from 'react'
import { categories, allWords } from './data/index.js'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'

export default function App() {
  const [view, setView] = useState('home')
  const [pool, setPool] = useState([])
  const [title, setTitle] = useState('')

  function startMixed() {
    setPool(allWords)
    setTitle('Quick play')
    setView('quiz')
  }

  function startCategory(cat) {
    setPool(cat.words.map((w) => ({ ...w, categoryId: cat.id, categoryName: cat.name })))
    setTitle(cat.name)
    setView('quiz')
  }

  return (
    <div className="app">
      {view === 'home' && (
        <Home categories={categories} onStartMixed={startMixed} onStartCategory={startCategory} />
      )}
      {view === 'quiz' && <Quiz pool={pool} title={title} onExit={() => setView('home')} />}
    </div>
  )
}
