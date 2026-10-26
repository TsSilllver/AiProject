import { useState, useEffect } from 'react'
import MainMenu from './components/MainMenu'
import Setup from './pages/Setup'
import Session from './pages/Session'
import Report from './pages/Report'
import './App.css'

function App() {
  const [screen, setScreen] = useState('setup')
  const [config, setConfig] = useState(null)
  const [sessionResult, setSessionResult] = useState(null)
  
  const [isMenuOpen, setIsMenuOpen] = useState(() => window.innerWidth > 768)

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('argumentum_history')
    return saved ? JSON.parse(saved) : []
  })

  // Следим за шириной экрана
  useEffect(() => {
    const handleResize = () => {
      // Если перешли на ПК (шире 768px), принудительно открываем меню
      if (window.innerWidth > 768) {
        setIsMenuOpen(true)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    localStorage.setItem('argumentum_history', JSON.stringify(history))
  }, [history])

  const handleStart = (newConfig) => {
    setConfig(newConfig)
    setScreen('session')
    // На ПК меню остается открытым, на мобилках закрывается
    setIsMenuOpen(window.innerWidth > 768)
  }

  const handleFinish = (result) => {
    const newHistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }),
      config: result.config,
      messages: result.messages,
      turns: result.turns,
      isPinned: false
    }
    
    setHistory(prev => [newHistoryItem, ...prev])
    setSessionResult(newHistoryItem)
    setScreen('report')
    setIsMenuOpen(window.innerWidth > 768)
  }

  const handleOpenHistory = (historyItem) => {
    setSessionResult(historyItem)
    setScreen('report')
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
    setScreen('setup')
    setIsMenuOpen(window.innerWidth > 768)
  }

  const isSessionActive = screen === 'session' && config
  const isMenuCollapsed = isSessionActive && !isMenuOpen

  const pinnedHistory = history.filter(item => item.isPinned)
  const regularHistory = history.filter(item => !item.isPinned)

  return (
    <div className="app-layout">
      {/* Оверлей для закрытия меню на мобилках */}
      {isMenuOpen && (
        <div className="mobile-overlay" onClick={() => setIsMenuOpen(false)}></div>
      )}

      {/* Объединенный хедер */}
      <div className="mobile-header">
        <button className="mobile-burger" onClick={() => setIsMenuOpen(true)}>
          ☰
        </button>
        
        {isSessionActive ? (
          <div className="mobile-progress-container">
            <div className="mobile-progress-bar">
              <div 
                className="mobile-progress-fill" 
                style={{ width: `${Math.min((sessionResult?.turns || 0) / config.questionsCount * 100, 100)}%` }}
              />
            </div>
            <span className="mobile-progress-text">
              {sessionResult?.turns || 0} / {config.questionsCount}
            </span>
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
        onFinishSession={handleReset}
      />
      
      <div className={`app-content ${isMenuCollapsed ? 'menu-collapsed' : ''}`}>
        {screen === 'setup' && <Setup onStart={handleStart} />}
        {screen === 'session' && config && (
          <Session 
            config={config} 
            onFinish={handleFinish} 
            onProgressUpdate={(turns) => setSessionResult(prev => ({ ...prev, turns }))}
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