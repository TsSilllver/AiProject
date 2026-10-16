import './ProgressBar.css'

function ProgressBar({ current, total, label }) {
  const percent = Math.min((current / total) * 100, 100)

  return (
    <div className="progress">
      <div className="progress-info">
        <span>{label}</span>
        <span className="progress-count">
          {current} / {total}
        </span>
      </div>
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  )
}

export default ProgressBar