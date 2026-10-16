import { useState } from 'react'
import Input from '../components/Input'
import Select from '../components/Select'
import Button from '../components/Button'
import RolePicker from '../components/RolePicker'
import { scenarioExamples, strictnessLevels } from '../data/scenarios'
import { roles } from '../data/roles'
import './Setup.css'

function Setup({ onStart }) {
  const [scenario, setScenario] = useState('')
  const [role, setRole] = useState('interviewer')
  const [strictness, setStrictness] = useState('standard')
  const [turns, setTurns] = useState(8)

  const canStart = scenario.trim().length > 10

  const handleStart = () => {
    if (!canStart) return
    onStart({ scenario: scenario.trim(), role, strictness, turns })
  }

  return (
    <div className="setup">
      <div className="setup-container">
        <header className="setup-header">
          <h1>Настройка сессии</h1>
          <p>
            Опишите ситуацию, выберите роль собеседника и уровень строгости.
            Argumentum построит диалог и будет оценивать ваши ответы по ходу.
          </p>
        </header>

        <section className="setup-section">
          <label className="setup-label">Ситуация</label>
          <Input
            multiline
            rows={3}
            value={scenario}
            onChange={setScenario}
            placeholder="Например: собеседование на junior-разработчика в IT-компании"
          />
          <div className="setup-examples">
            {scenarioExamples.map((ex) => (
              <button
                key={ex}
                type="button"
                className="setup-example"
                onClick={() => setScenario(ex)}
              >
                {ex}
              </button>
            ))}
          </div>
        </section>

        <section className="setup-section">
          <label className="setup-label">Роль собеседника</label>
          <RolePicker roles={roles} value={role} onChange={setRole} />
        </section>

        <section className="setup-section">
          <label className="setup-label">Режим</label>
          <div className="setup-grid">
            <Select
              value={strictness}
              onChange={setStrictness}
              options={strictnessLevels.map((l) => ({
                value: l.value,
                label: `${l.label} — ${l.desc}`,
              }))}
            />
            <Select
              value={turns}
              onChange={(v) => setTurns(Number(v))}
              options={[
                { value: 5, label: '5 вопросов (короткая сессия)' },
                { value: 8, label: '8 вопросов (стандарт)' },
                { value: 12, label: '12 вопросов (глубокая)' },
                { value: 20, label: '20 вопросов (полная)' },
              ]}
            />
          </div>
        </section>

        <div className="setup-actions">
          <Button size="lg" onClick={handleStart} disabled={!canStart}>
            Начать сессию
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Setup