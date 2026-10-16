import './Layout.css'

function Layout({ children, onReset }) {
  return (
    <div className="layout">
      <header className="layout-header">
        <div className="layout-brand">
          <div className="layout-logo">A</div>
          <div>
            <div className="layout-name">Argumentum</div>
            <div className="layout-tagline">тренажёр диалоговых ситуаций</div>
          </div>
        </div>

        {onReset && (
          <button className="layout-reset" onClick={onReset}>
            Новая сессия
          </button>
        )}
      </header>

      <main className="layout-main">{children}</main>

      <footer className="layout-footer">
        <span>Argumentum © 2026</span>
        <span>Академический проект</span>
      </footer>
    </div>
  )
}

export default Layout