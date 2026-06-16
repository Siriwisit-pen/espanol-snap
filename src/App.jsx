import { useState } from 'react'
import { categories, allWords } from './data/index.js'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Conversations from './components/Conversations.jsx'
import ConversationQuiz from './components/ConversationQuiz.jsx'

export default function App() {
  const [view, setView] = useState('home')
  const [pool, setPool] = useState([])
  const [title, setTitle] = useState('')
  const [activeConv, setActiveConv] = useState(null)

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

  function startConv(conv) {
    setActiveConv(conv)
    setView('conversationQuiz')
  }

  return (
    <div className="app">
      {view === 'home' && (
        <Home
          categories={categories}
          onStartMixed={startMixed}
          onStartCategory={startCategory}
          onConversations={() => setView('conversations')}
        />
      )}
      {view === 'quiz' && <Quiz pool={pool} title={title} onExit={() => setView('home')} />}
      {view === 'conversations' && (
        <Conversations onStart={startConv} onBack={() => setView('home')} />
      )}
      {view === 'conversationQuiz' && activeConv && (
        <ConversationQuiz conv={activeConv} onBack={() => setView('conversations')} />
      )}
    </div>
  )
}
