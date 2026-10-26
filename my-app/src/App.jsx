import { useState, useEffect, useRef } from 'react'
import MainMenu from './components/MainMenu'
import Setup from './pages/Setup'
import Session from './pages/Session'
import Report from './pages/Report'
import './App.css'

function App() {
  const [screen, setScreen] = useState('setup')
  const [config, setConfig] = useState(null)
  const [sessionResult, setSessionResult] = useState(null)
  
  const [currentTurns, setCurrentTurns] = useState(0)
  const [currentMessages, setCurrentMessages] = useState([]) // Храним текущие сообщения для завершения из меню

  const [isMenuOpen, setIsMenuOpen] = useState(() => window.innerWidth > 768)
  const prevWidthRef = useRef(window.innerWidth)

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('argumentum_history')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth
      const prevWidth = prevWidthRef.current
      if (prevWidth <= 768 && currentWidth > 768 && screen !== 'session') {
        setIsMenuOpen(true)
      }
      if (prevWidth > 768 && currentWidth <= 768) {
        setIsMenuOpen(false)
      }
      prevWidthRef.current = currentWidth
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [screen])

  useEffect(() => {
    localStorage.setItem('argumentum_history', JSON.stringify(history))
  }, [history])

  const handleStart = (newConfig) => {
    setConfig(newConfig)
    setCurrentTurns(0)
    setCurrentMessages([])
    setScreen('session')
    setIsMenuOpen(false) 
  }

  // ЕДИНАЯ ФУНКЦИЯ ЗАВЕРШЕНИЯ (вызывается и из чата, и из меню)
  const processFinish = (turns, messages) => {
    if (!config) return;
    
    const newHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      config: config,
      messages: messages,
      turns: turns,
      isPinned: false
    }
    
    setHistory(prev => {
      // Проверка на дубликаты (чтобы не сохранить дважды)
      const exists = prev.find(item => item.id === newHistoryItem.id)
      if (exists) return prev
      return [newHistoryItem, ...prev]
    })
    
    setSessionResult(newHistoryItem)
    setScreen('report')
    setIsMenuOpen(false) 
  }

  const handleOpenHistory = (historyItem) => {
    setSessionResult(historyItem)
    setScreen('report')
    setIsMenuOpen(false)
  }

  const handleDeleteHistory = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id))
    if (sessionResult?.id === id) setScreen('setup')
  }

  const handlePinHistory = (id) => {
    setHistory(prev => prev.map(item => 
      item.id === id ? { ...item, isPinned: !item.isPinned } : item
    ))
  }

  const handleReset = () => {
    setConfig(null)
    setSessionResult(null)
    setCurrentTurns(0)
    setCurrentMessages([])
    setScreen('setup')
    if (window.innerWidth > 768) setIsMenuOpen(true)
  }

  const isSessionActive = screen === 'session' && config
  const isMenuCollapsed = isSessionActive && !isMenuOpen

  const pinnedHistory = history.filter(item => item.isPinned)
  const regularHistory = history.filter(item => !item.isPinned)

  return (
    <div className="app-layout">
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)}></div>
      )}

      <div className="mobile-header">
        <button className="mobile-burger" onClick={() => setIsMenuOpen(true)}>☰</button>
        {isSessionActive ? (
          <div className="mobile-progress-container">
            <div className="mobile-progress-bar">
              <div className="mobile-progress-fill" style={{ width: `${Math.min((currentTurns / config.questionsCount) * 100, 100)}%` }} />
            </div>
            <span className="mobile-progress-text">{currentTurns} / {config.questionsCount}</span>
          </div>
        ) : (
          <div className="mobile-brand" onClick={handleReset}>
            <div className="mobile-logo">A</div>
            <span>Argumentum</span>
          </div>
        )}
      </div>

      <MainMenu 
        isOpen={isMenuOpen} 
        isCollapsed={isMenuCollapsed}
        toggleMenu={() => setIsMenuOpen(!isMenuOpen)}
        pinnedHistory={pinnedHistory}
        regularHistory={regularHistory}
        onOpenHistory={handleOpenHistory}
        onDeleteHistory={handleDeleteHistory}
        onPinHistory={handlePinHistory}
        onNewSession={handleReset}
        isSessionActive={isSessionActive}
        // ВАЖНО: Передаем функцию завершения с актуальными данными
        onFinishSession={() => processFinish(currentTurns, currentMessages)}
      />
      
      <div className={`app-content ${isMenuCollapsed ? 'menu-collapsed' : ''}`}>
        {screen === 'setup' && <Setup onStart={handleStart} />}
        
        {screen === 'active' /* заглушка, используется 'session' */} 
        {screen === 'session' && config && (
          <Session 
            key={config.scenario}
            config={config} 
            // Обычное завершение из чата
            onFinish={(result) => processFinish(result.turns, result.messages)} 
            // Обновляем счетчик и сообщения для меню
            onProgressUpdate={(turns, msgs) => {
              setCurrentTurns(turns);
              if (msgs) setCurrentMessages(msgs);
            }}
          />
        )}
        
        {screen === 'report' && sessionResult && (
          <Report result={sessionResult} onRestart={handleReset} />
        )}
      </div>
    </div>
  )
}

export default App