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
  const [isMenuOpen, setIsMenuOpen] = useState(true)

  // Загрузка истории
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('argumentum_history')
    return saved ? JSON.parse(saved) : []
  })

  // Сохранение истории
  useEffect(() => {
    localStorage.setItem('argumentum_history', JSON.stringify(history))
  }, [history])

  const handleStart = (newConfig) => {
    setConfig(newConfig)
    setScreen('session')
    setIsMenuOpen(false) // Сворачиваем меню при старте
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
    setIsMenuOpen(true) // Разворачиваем меню при завершении
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
    setIsMenuOpen(true)
  }

  const isMenuCollapsed = screen === 'session' && !isMenuOpen

  // Разделяем историю на закрепленные и обычные
  const pinnedHistory = history.filter(item => item.isPinned)
  const regularHistory = history.filter(item => !item.isPinned)

  return (
    <div className="app-layout">
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
      />
      
      <div className={`app-content ${isMenuCollapsed ? 'menu-collapsed' : ''}`}>
        {screen === 'setup' && <Setup onStart={handleStart} />}
        {screen === 'session' && config && (
          <Session config={config} onFinish={handleFinish} />
        )}
        {screen === 'report' && sessionResult && (
          <Report result={sessionResult} onRestart={handleReset} />
        )}
      </div>
    </div>
  )
}

export default App