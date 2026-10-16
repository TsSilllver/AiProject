import { useEffect, useRef, useState } from 'react'
import Input from '../components/Input'
import Button from '../components/Button'
import Message from '../components/Message'
import ProgressBar from '../components/ProgressBar'
import { useChat } from '../hooks/useChat'
import './Session.css'

function Session({ config, onFinish }) {
  const { messages, loading, error, sendMessage, startSession } = useChat(config)
  const [input, setInput] = useState('')
  const [userTurns, setUserTurns] = useState(0)
  const scrollRef = useRef(null)

  useEffect(() => {
    startSession()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    const newTurns = userTurns + 1
    setUserTurns(newTurns)

    await sendMessage(text)

    if (newTurns >= config.turns) {
      setTimeout(() => {
        onFinish({
          config,
          messages,
          turns: newTurns,
        })
      }, 800)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="session">
      <div className="session-sidebar">
        <div className="session-info">
          <div className="session-info-label">Ситуация</div>
          <div className="session-info-value">{config.scenario}</div>
        </div>

        <div className="session-info">
          <div className="session-info-label">Режим</div>
          <div className="session-info-value">{config.strictness}</div>
        </div>

        <ProgressBar
          current={userTurns}
          total={config.turns}
          label="Прогресс"
        />

        <Button variant="secondary" onClick={() => onFinish({ config, messages, turns: userTurns })}>
          Завершить сессию
        </Button>
      </div>

      <div className="session-main">
        <div className="session-messages" ref={scrollRef}>
          {messages.map((msg, i) => (
            <Message key={i} role={msg.role} content={msg.content} />
          ))}

          {loading && (
            <div className="session-loading">
              <span />
              <span />
              <span />
            </div>
          )}

          {error && (
            <div className="session-error">
              Ошибка: {error}. Проверьте ключ API в файле .env
            </div>
          )}
        </div>

        <div className="session-input">
          <Input
            multiline
            rows={2}
            value={input}
            onChange={setInput}
            placeholder="Ваш ответ... (Enter — отправить, Shift+Enter — новая строка)"
          />
          <Button onClick={handleSend} disabled={!input.trim() || loading}>
            Отправить
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Session