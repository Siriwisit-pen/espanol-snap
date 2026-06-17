import { useState } from 'react'
import { categories, allWords } from './data/index.js'
import Home from './components/Home.jsx'
import Quiz from './components/Quiz.jsx'
import Conversations from './components/Conversations.jsx'
import ConversationQuiz from './components/ConversationQuiz.jsx'
import Grammar from './components/Grammar.jsx'
import GrammarLesson from './components/GrammarLesson.jsx'
import MyWords from './components/MyWords.jsx'

export default function App() {
  const [view, setView] = useState('home')
  const [pool, setPool] = useState([])
  const [title, setTitle] = useState('')
  const [activeConv, setActiveConv] = useState(null)
  const [activeTopic, setActiveTopic] = useState(null)
  const [quickLevels, setQuickLevels] = useState(new Set(['A', 'B', 'C']))

  function toggleQuickLevel(lvl) {
    setQuickLevels((prev) => {
      const next = new Set(prev)
      if (next.has(lvl) && next.size > 1) next.delete(lvl)
      else next.add(lvl)
      return next
    })
  }

  function startMixed() {
    const filtered = allWords.filter((w) => quickLevels.has(w.level || 'A'))
    setPool(filtered)
    setTitle('Quick play')
    setView('quiz')
  }

  function startCategory(cat) {
    setPool(cat.words.map((w) => ({ ...w, categoryId: cat.id, categoryName: cat.name })))
    setTitle(cat.name)
    setView('quiz')
  }

  function startMyWordsQuiz(words) {
    setPool(words)
    setTitle('My Words')
    setView('quiz')
  }

  function startConv(conv) {
    setActiveConv(conv)
    setView('conversationQuiz')
  }

  function startGrammarTopic(topic) {
    setActiveTopic(topic)
    setView('grammarLesson')
  }

  return (
    <div className="app">
      {view === 'home' && (
        <Home
          categories={categories}
          onStartMixed={startMixed}
          onStartCategory={startCategory}
          onConversations={() => setView('conversations')}
          onGrammar={() => setView('grammar')}
          onMyWords={() => setView('myWords')}
          quickLevels={quickLevels}
          onToggleQuickLevel={toggleQuickLevel}
        />
      )}
      {view === 'quiz' && <Quiz pool={pool} title={title} onExit={() => setView('home')} />}
      {view === 'conversations' && (
        <Conversations onStart={startConv} onBack={() => setView('home')} />
      )}
      {view === 'conversationQuiz' && activeConv && (
        <ConversationQuiz conv={activeConv} onBack={() => setView('conversations')} />
      )}
      {view === 'grammar' && (
        <Grammar onStart={startGrammarTopic} onBack={() => setView('home')} />
      )}
      {view === 'grammarLesson' && activeTopic && (
        <GrammarLesson topic={activeTopic} onBack={() => setView('grammar')} />
      )}
      {view === 'myWords' && (
        <MyWords onBack={() => setView('home')} onQuiz={startMyWordsQuiz} />
      )}
    </div>
  )
}
