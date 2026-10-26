import Button from '../components/Button'
import './Report.css'

function Report({ result, onRestart }) {
  const { config, messages } = result

  return (
    <div className="report-container">
      <header className="report-header">
        <div className="report-badge">Сессия завершена</div>
        <h1>Отчёт</h1>
        <p>Ситуация: {config.scenario}</p>
      </header>

      <section className="report-section">
        <h2>История диалога</h2>
        <div className="report-dialog">
          {messages.map((msg, i) => (
            <div key={i} className={`report-msg report-msg-${msg.role}`}>
              <span className="report-msg-author">
                {msg.role === 'assistant' ? 'ИИ' : 'Вы'}:
              </span>
              <span className="report-msg-text">{msg.content}</span>
            </div>
          ))}
        </div>
      </section>

      <div className="report-actions">
        <Button variant="secondary" onClick={onRestart}>Новая сессия</Button>
      </div>
    </div>
  )
}

export default Report