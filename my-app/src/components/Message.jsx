import './Message.css'

function Message({ role, content, evaluation }) {
  return (
    <div className={`message message-${role}`}>
      <div className="message-header">
        <span className="message-author">
          {role === 'assistant' ? 'Собеседующий' : 'Вы'}
        </span>
      </div>
      <div className="message-body">{content}</div>

      {evaluation && (
        <div className="message-evaluation">
          <div className="evaluation-header">Разбор ответа</div>
          <div className="evaluation-grid">
            {evaluation.strengths?.length > 0 && (
              <div className="evaluation-item evaluation-strength">
                <div className="evaluation-label">Сильные стороны</div>
                <ul>
                  {evaluation.strengths.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
            {evaluation.weaknesses?.length > 0 && (
              <div className="evaluation-item evaluation-weakness">
                <div className="evaluation-label">Слабые места</div>
                <ul>
                  {evaluation.weaknesses.map((s, i) => (
                    <li key={i}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Message