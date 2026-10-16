import './RolePicker.css'

function RolePicker({ roles, value, onChange }) {
  return (
    <div className="role-picker">
      {roles.map((role) => (
        <button
          key={role.value}
          type="button"
          className={`role-option ${value === role.value ? 'active' : ''}`}
          onClick={() => onChange(role.value)}
        >
          <span className="role-icon">{role.icon}</span>
          <div>
            <div className="role-label">{role.label}</div>
            <div className="role-desc">{role.desc}</div>
          </div>
        </button>
      ))}
    </div>
  )
}

export default RolePicker