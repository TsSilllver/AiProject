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

СТРОГИЕ ПРАВИЛА (НАРУШАТЬ ЗАПРЕЩЕНО):
1. ЗАПРЕЩЕНО здороваться. Начинай диалог СРАЗУ с первого вопроса.
2. Всего ты должен задать РОВНО ${questionsCount} вопросов. Считай каждый свой вопрос.
3. ЗАПРЕЩЕНО писать любые анонсы и служебные пометки (например, "Разбор будет предоставлен после вашего ответа", "Оценка:", "Комментарий:"). Пиши как живой человек.
4. ЗАПРЕЩЕНО давать разбор ответа пользователя в том же сообщении, где ты задаешь новый вопрос.
5. Если ты задаешь ВОПРОС ПОД НОМЕРОМ ${questionsCount} (последний), ты ОБЯЗАН начать его строго с фразы: "Завершающий вопрос: " и задать сам вопрос. НИКАКИХ РАЗБОРОВ, ПРОЩАНИЙ ИЛИ ДРУГИХ СЛОВ в этом сообщении быть не должно.
6. Когда пользователь ответит на этот последний вопрос, в СВОЕМ СЛЕДУЮЩЕМ СООБЩЕНИИ ты должен:
   - Сначала дать краткий разбор последнего ответа пользователя.
   - В самом конце добавить фразу: "Спасибо за ответы. Нажмите кнопку 'Завершить сессию' для получения результатов."
7. Задавай только по одному вопросу за раз. Отвечай на русском.`
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
            // ИЗМЕНЕНИЕ ЗДЕСЬ: убрали слово "приветствие" и жестко указали, что делать
            { role: 'user', content: 'Сгенерируй первый вопрос по заданной ситуации. Не здоровайся, пиши сразу вопрос.' },
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