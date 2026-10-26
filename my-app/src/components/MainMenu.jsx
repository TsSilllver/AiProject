import './MainMenu.css'

function MainMenu({ 
  isOpen, 
  isCollapsed, 
  toggleMenu, 
  pinnedHistory, 
  regularHistory, 
  onOpenHistory, 
  onDeleteHistory, 
  onPinHistory, 
  onNewSession 
}) {
  
  const renderHistoryItem = (item) => (
    <div key={item.id} className={`menu-history-item ${item.isPinned ? 'pinned' : ''}`}>
      <div className="history-info" onClick={() => onOpenHistory(item)}>
        <div className="history-scenario">
          {item.config.scenario}
        </div>
        <div className="history-date">{item.date}</div>
      </div>
      
      <div className="history-actions">
        <button 
          className={`history-pin ${item.isPinned ? 'active' : ''}`}
          onClick={(e) => { e.stopPropagation(); onPinHistory(item.id); }}
          title={item.isPinned ? "Открепить" : "Закрепить"}
        >
          📌
        </button>
        <button 
          className="history-delete" 
          onClick={(e) => { e.stopPropagation(); onDeleteHistory(item.id); }}
          title="Удалить"
        >
          ✕
        </button>
      </div>
    </div>
  )

  return (
    <aside className={`main-menu ${isOpen ? 'open' : 'closed'} ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="menu-header">
        {isOpen ? (
          <div className="menu-header-expanded">
            <div className="logo-container" onClick={onNewSession}>
              <div className="menu-logo">A</div>
              <span className="menu-title">Argumentum</span>
            </div>
            <button className="menu-burger" onClick={toggleMenu} title="Закрыть меню">☰</button>
          </div>
        ) : (
          <div className="menu-header-collapsed">
            <div className="menu-logo" onClick={onNewSession} title="На главную">A</div>
            <button className="menu-burger" onClick={toggleMenu} title="Развернуть меню">☰</button>
          </div>
        )}
      </div>

      {isOpen && (
        <div className="menu-drawer">
          <button className="menu-btn-primary" onClick={onNewSession}>
            + Новая сессия
          </button>
          
          <div className="menu-history">
            {pinnedHistory.length === 0 && regularHistory.length === 0 && (
              <div className="menu-empty">Пока пусто</div>
            )}

            {pinnedHistory.length > 0 && (
              <>
                <div className="menu-history-title">Закреплённые</div>
                {pinnedHistory.map(renderHistoryItem)}
              </>
            )}

            {pinnedHistory.length > 0 && regularHistory.length > 0 && (
              <div className="history-divider" />
            )}

            {regularHistory.length > 0 && (
              <>
                <div className="menu-history-title" style={{ marginTop: pinnedHistory.length > 0 ? '16px' : '0' }}>
                  История
                </div>
                {regularHistory.map(renderHistoryItem)}
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

export default MainMenu