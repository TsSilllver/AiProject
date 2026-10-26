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
  const [isMenuOpen, setIsMenuOpen] = useState(() => window.innerWidth > 768)

  // Храним предыдущую ширину, чтобы понять, был ли переход с мобилки на ПК
  const prevWidthRef = useRef(window.innerWidth)

  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('argumentum_history')
    return saved ? JSON.parse(saved) : []
  })

  useEffect(() => {
    const handleResize = () => {
      const currentWidth = window.innerWidth
      const prevWidth = prevWidthRef.current
      
      // Если мы были на мобилке (< 768) и перешли на ПК (> 768)
      if (prevWidth <= 768 && currentWidth > 768) {
        // Открываем меню ТОЛЬКО если мы НЕ в сессии
        // Если мы в сессии, то меню должно оставаться свернутым (как ты и хотел)
        if (screen !== 'session') {
          setIsMenuOpen(true)
        }
      }
      
      // Если ушли на мобилку, принудительно закрываем меню
      if (prevWidth > 768 && currentWidth <= 768) {
        setIsMenuOpen(false)
      }

      prevWidthRef.current = currentWidth
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [screen]) // Добавили зависимость от screen, чтобы эффект видел актуальный экран

  useEffect(() => {
    localStorage.setItem('argumentum_history', JSON.stringify(history))
  }, [history])

  const handleStart = (newConfig) => {
    setConfig(newConfig)
    setCurrentTurns(0)
    setScreen('session')
    
    // При старте сессии на ПК меню можно свернуть (чтобы было больше места),
    // на мобилках оно и так скрыто
    setIsMenuOpen(false) 
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
    
    // Когда завершаем сессию и переходим к отчету, на ПК можно развернуть меню обратно
    if (window.innerWidth > 768) {
      setIsMenuOpen(true)
    }
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
    setScreen('setup')
    
    // При возврате на главную на ПК открываем меню
    if (window.innerWidth > 768) {
      setIsMenuOpen(true)
    }
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
        <button className="mobile-burger" onClick={() => setIsMenuOpen(true)}>
          ☰
        </button>
        
        {isSessionActive ? (
          <div className="mobile-progress-container">
            <div className="mobile-progress-bar">
              <div 
                className="mobile-progress-fill" 
                style={{ width: `${Math.min((currentTurns / config.questionsCount) * 100, 100)}%` }}
              />
            </div>
            <span className="mobile-progress-text">
              {currentTurns} / {config.questionsCount}
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
            key={config.scenario} // Добавили key, чтобы сессия пересоздавалась с нуля
            config={config} 
            onFinish={handleFinish} 
            onProgressUpdate={(turns) => setCurrentTurns(turns)}
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