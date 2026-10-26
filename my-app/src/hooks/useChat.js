import { useState, useCallback } from 'react'

const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api.php`
  : '/api.php'

function buildSystemPrompt(config) {
  const { scenario, role, strictness, questionsCount } = config

  const roleMap = {
    interviewer: 'Ты — строгий HR-специалист или технический интервьюер. Твоя цель — проверить компетенции кандидата, задавая каверзные вопросы и требуя конкретных примеров.',
    teacher: 'Ты — экзаменатор или научный руководитель. Твоя цель — проверить глубину знаний, логику и умение аргументировать. Ты можешь задавать уточняющие вопросы, если ответ поверхностный.',
    opponent: 'Ты — оппонент в дебатах. Твоя цель — оспорить точку зрения пользователя, найти слабые места в аргументах и заставить защищаться.',
    listener: 'Ты — человек, который ничего не понимает в теме. Твоя цель — задавать «глупые» вопросы и просить объяснить сложные термины простыми словами.'
  }

  const strictnessMap = {
    learning: 'Давай развёрнутый разбор после каждого ответа пользователя. Будь доброжелателен.',
    standard: 'Веди реалистичный диалог. Давай краткий разбор только после важных ответов.',
    strict: 'Придирайся к формулировкам, задавай уточняющие вопросы. Не хвали.',
    examination: 'Не давай обратной связи во время диалога. Только в конце.',
  }

  return `Ты — тренажёр диалоговых ситуаций. Роль: ${roleMap[role] || role}. Ситуация: ${scenario}.

РЕЖИМ: ${strictnessMap[strictness]}

ВАЖНЫЕ ПРАВИЛА:
1. В САМОМ ПЕРВОМ сообщении сразу задай первый вопрос по теме ситуации (не нужно здороваться или просить представиться).
2. Всего в сессии должно быть РОВНО ${questionsCount} вопросов от тебя. Ты должен задать первый вопрос, второй, третий и т.д. до ${questionsCount}.
3. Когда ты задаешь ${questionsCount}-й (последний) вопрос, ты ОБЯЗАН начать его со слов "Завершающий вопрос: " и задать сам вопрос. НИЧЕГО БОЛЬШЕ НЕ ПИШИ в этом сообщении.
4. Когда пользователь ответит на этот ${questionsCount}-й вопрос, ты должен СНАЧАЛА дать краткий разбор его последнего ответа, а ЗАТЕМ в конце сообщения добавить фразу: "Спасибо за ответы. Нажмите кнопку 'Завершить и посмотреть отчёт' для получения результатов". И БОЛЬШЕ НИЧЕГО НЕ ПИШИ.
5. Задавай по одному вопросу за раз. Не давай готовых ответов.
6. Отвечай на русском языке.`
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              { role: 'system', content: buildSystemPrompt(config) },
              ...newMessages,
            ],
            temperature: 0.7,
          }),
        })

        if (!response.ok) throw new Error(`Ошибка API: ${response.status}`)
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
    [messages, config]
  )

  const startSession = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: buildSystemPrompt(config) },
            { role: 'user', content: 'Начни сессию с приветствия и первого вопроса.' },
          ],
          temperature: 0.7,
        }),
      })

      if (!response.ok) throw new Error(`Ошибка API: ${response.status}`)
      const data = await response.json()
      setMessages([{ role: 'assistant', content: data.choices[0].message.content }])
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [config])

  return { messages, loading, error, sendMessage, startSession }
}