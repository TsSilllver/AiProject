import { useEffect, useRef, useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import Message from '../components/Message'
import ProgressBar from '../components/ProgressBar'
import { useChat } from '../hooks/useChat'
import './Session.css'

function Session({ config, onFinish, onProgressUpdate }) {
  const { messages, loading, error, sendMessage, startSession } = useChat(config)
  const [input, setInput] = useState('')
  const [userTurns, setUserTurns] = useState(0)
  const scrollRef = useRef(null)
  const layoutRef = useRef(null)

  useEffect(() => {
    startSession()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  // Передаем наверх и счетчик, и историю сообщений
  useEffect(() => {
    if (onProgressUpdate) onProgressUpdate(userTurns, messages)
  }, [userTurns, messages, onProgressUpdate])

  // Фикс клавиатуры
  useEffect(() => {
    const handleResize = () => {
      if (window.visualViewport && layoutRef.current) {
        layoutRef.current.style.height = `${window.visualViewport.height}px`
        if (scrollRef.current) {
          setTimeout(() => { scrollRef.current.scrollTop = scrollRef.current.scrollHeight }, 100)
        }
      }
    }
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
      window.visualViewport.addEventListener('scroll', handleResize)
    }
    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
        window.visualViewport.removeEventListener('scroll', handleResize)
      }
    }
  }, [])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    const newTurns = userTurns + 1
    setUserTurns(newTurns)
    await sendMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleFinish = () => {
    onFinish({ config, messages, turns: userTurns })
  }

  return (
    <div className="session-layout" ref={layoutRef}>
      <div className="session-sidebar">
        <div className="session-info">
          <div className="session-info-label">Ситуация</div>
          <div className="session-info-value">{config.scenario}</div>
        </div>
        <ProgressBar current={userTurns} total={config.questionsCount} label="Прогресс" />
        <Button variant="secondary" onClick={handleFinish}>
          Завершить и посмотреть отчёт
        </Button>
      </div>

      <div className="session-main">
        <div className="session-messages" ref={scrollRef}>
          {messages.map((msg, i) => (
            <Message key={i} role={msg.role} content={msg.content} />
          ))}
          {loading && <div className="session-loading"><span /><span /><span /></div>}
          {error && <div className="session-error">Ошибка: {error}</div>}
        </div>

        <div className="session-input">
          <Input multiline rows={2} value={input} onChange={setInput} placeholder="Ваш ответ..." onKeyDown={handleKeyDown} />
          <Button onClick={handleSend} disabled={!input.trim() || loading}>Отправить</Button>
        </div>
      </div>
    </div>
  )
}

export default Session