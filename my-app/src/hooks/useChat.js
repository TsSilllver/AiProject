import { useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api.php`
  : '/api.php'

function buildSystemPrompt(config) {
  const { scenario, role, strictness } = config

  const strictnessMap = {
    learning: 'Давай развёрнутый разбор после каждого ответа пользователя. Будь доброжелателен.',
    standard: 'Веди реалистичный диалог. Давай краткий разбор только после важных ответов.',
    strict: 'Придирайся к формулировкам, задавай уточняющие вопросы. Не хвали.',
    examination: 'Не давай обратной связи во время диалога. Только в конце.',
  }

  return `Ты — тренажёр диалоговых ситуаций. Роль: ${role}. Ситуация: ${scenario}.

Режим: ${strictnessMap[strictness]}

Правила:
- Всегда оставайся в роли. Если пользователь уходит от темы — возвращай его обратно.
- Задавай по одному вопросу за раз.
- Не давай готовых ответов на свои вопросы.
- Если пользователь отвечает слабо — уточняй и копай глубже.
- Отвечай на русском языке.`
}

export function useChat(config) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const sendMessage = useCallback(
    async (userText) => {
      const userMessage = { role: 'user', content: userText }
      const newMessages = [...messages, userMessage]

      setMessages(newMessages)
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'deepseek-chat',
            messages: [
              { role: 'system', content: buildSystemPrompt(config) },
              ...newMessages,
            ],
            temperature: 0.7,
          }),
        })

        if (!response.ok) {
          throw new Error(`Ошибка API: ${response.status}`)
        }

        const data = await response.json()
        const assistantMessage = {
          role: 'assistant',
          content: data.choices[0].message.content,
        }

        setMessages((prev) => [...prev, assistantMessage])
        return assistantMessage
      } catch (err) {
        setError(err.message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [messages, config],
  )

  const startSession = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            { role: 'system', content: buildSystemPrompt(config) },
            { role: 'user', content: 'Начни сессию с приветствия и первого вопроса.' },
          ],
          temperature: 0.7,
        }),
      })

      if (!response.ok) {
        throw new Error(`Ошибка API: ${response.status}`)
      }

      const data = await response.json()
      const firstMessage = {
        role: 'assistant',
        content: data.choices[0].message.content,
      }

      setMessages([firstMessage])
    } catch (err) {
        setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [config])

  return { messages, loading, error, sendMessage, startSession }
}