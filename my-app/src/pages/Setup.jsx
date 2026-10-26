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
  const [questionsCount, setQuestionsCount] = useState(5) // Новое поле

  const canStart = scenario.trim().length > 10

  const handleStart = () => {
    if (!canStart) return
    onStart({ scenario: scenario.trim(), role, strictness, questionsCount })
  }

  return (
    <div className="setup-container">
      <header className="setup-header">
        <h1>Настройка сессии</h1>
        <p>Опишите ситуацию, выберите роль собеседника и уровень строгости.</p>
      </header>

      <section className="setup-section">
        <label className="setup-label">Ситуация</label>
        <Input multiline rows={3} value={scenario} onChange={setScenario} placeholder="Например: собеседование на junior-разработчика в IT-компании" />
        <div className="setup-examples">
          {scenarioExamples.map((ex) => (
            <button key={ex} type="button" className="setup-example" onClick={() => setScenario(ex)}>{ex}</button>
          ))}
        </div>
      </section>

      <section className="setup-section">
        <label className="setup-label">Роль собеседника</label>
        <RolePicker roles={roles} value={role} onChange={setRole} />
      </section>

      <section className="setup-section">
        <label className="setup-label">Параметры</label>
        <div className="setup-grid">
          <Select value={strictness} onChange={setStrictness} options={strictnessLevels.map((l) => ({ value: l.value, label: l.label }))} />
          
          <Select 
            value={questionsCount} 
            onChange={(v) => setQuestionsCount(Number(v))} 
            options={[
              { value: 3, label: '3 вопроса (быстро)' },
              { value: 5, label: '5 вопросов (стандарт)' },
              { value: 10, label: '10 вопросов (глубоко)' },
              { value: 15, label: '15 вопросов (хардкор)' },
            ]} 
          />
        </div>
      </section>

      <div className="setup-actions">
        <Button size="lg" onClick={handleStart} disabled={!canStart}>Начать сессию</Button>
      </div>
    </div>
  )
}

export default Setup