import { useState, useEffect } from 'react'
import './MainMenu.css'

function MainMenu({ 
  isOpen, 
  isCollapsed, 
  toggleMenu, 
  pinnedHistory: propsPinned, 
  regularHistory: propsRegular, 
  onOpenHistory, 
  onDeleteHistory, 
  onPinHistory, 
  onNewSession,
  isSessionActive,
  onFinishSession
}) {
  // Локальный стейт для страховки на мобилках
  const [localHistory, setLocalHistory] = useState([])

  useEffect(() => {
    // Если меню открывается, подстраховываемся и читаем из localStorage
    if (isOpen) {
      const saved = localStorage.getItem('argumentum_history')
      if (saved) {
        setLocalHistory(JSON.parse(saved))
      }
    }
  }, [isOpen])

  // Если из App.jsx пришла пустая история (глюк мобилки), берем локальную
  const hasPropsHistory = propsPinned.length > 0 || propsRegular.length > 0
  const allHistory = hasPropsHistory ? [...propsPinned, ...propsRegular] : localHistory

  const pinned = allHistory.filter(item => item.isPinned)
  const regular = allHistory.filter(item => !item.isPinned)

  const renderHistoryItem = (item) => (
    <div key={item.id} className={`menu-history-item ${item.isPinned ? 'pinned' : ''}`}>
      <div className="history-info" onClick={() => onOpenHistory(item)}>
        <div className="history-scenario">{item.config.scenario}</div>
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
          
          {isSessionActive && (
            <button className="menu-btn-finish" onClick={onFinishSession}>
              ■ Завершить сессию
            </button>
          )}

          <div className="menu-history">
            {pinned.length === 0 && regular.length === 0 && (
              <div className="menu-empty">Пока пусто</div>
            )}

            {pinned.length > 0 && (
              <>
                <div className="menu-history-title">Закреплённые</div>
                {pinned.map(renderHistoryItem)}
              </>
            )}

            {pinned.length > 0 && regular.length > 0 && (
              <div className="history-divider" />
            )}

            {regular.length > 0 && (
              <>
                <div className="menu-history-title" style={{ marginTop: pinned.length > 0 ? '16px' : '0' }}>
                  История
                </div>
                {regular.map(renderHistoryItem)}
              </>
            )}
          </div>
        </div>
      )}
    </aside>
  )
}

export default MainMenu