import './Message.css'

function Message({ role, content }) {
  
  const formatText = (text) => {
    const parts = text.split(/(\*\*.*?\*\*)/g)
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index}>{part.slice(2, -2)}</strong>
      }
      return part
    })
  }

  return (
    <div className={`message message-${role}`}>
      <div className="message-header">
        <span className="message-author">
          {role === 'assistant' ? 'Собеседующий' : 'Вы'}
        </span>
      </div>
      <div className="message-body">{formatText(content)}</div>
    </div>
  )
}

export default Message