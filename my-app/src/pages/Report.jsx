import Button from '../components/Button'
import './Report.css'

function Report({ result, onRestart }) {
  const { config, messages, turns } = result
  const userMessages = messages.filter((m) => m.role === 'user')

  return (
    <div className="report">
      <div className="report-container">
        <header className="report-header">
          <div className="report-badge">Сессия завершена</div>
          <h1>Отчёт</h1>
          <p>{config.scenario}</p>
        </header>

        <section className="report-stats">
          <div className="report-stat">
            <div className="report-stat-value">{turns}</div>
            <div className="report-stat-label">Ответов</div>
          </div>
          <div className="report-stat">
            <div className="report-stat-value">{userMessages.length}</div>
            <div className="report-stat-label">Реплик</div>
          </div>
          <div className="report-stat">
            <div className="report-stat-value">
              {Math.round((turns / config.turns) * 100)}%
            </div>
            <div className="report-stat-label">Прогресс</div>
          </div>
        </section>

        <section className="report-section">
          <h2>Ваши ответы</h2>
          <div className="report-answers">
            {userMessages.map((msg, i) => (
              <div key={i} className="report-answer">
                <div className="report-answer-num">{i + 1}</div>
                <div className="report-answer-text">{msg.content}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="report-actions">
          <Button variant="secondary" onClick={onRestart}>
            Новая сессия
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Report