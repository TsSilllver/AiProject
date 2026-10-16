import { useState } from 'react'
import Layout from './components/Layout'
import Setup from './pages/Setup'
import Session from './pages/Session'
import Report from './pages/Report'
import './App.css'

function App() {
  const [screen, setScreen] = useState('setup') // setup | session | report
  const [config, setConfig] = useState(null)
  const [sessionResult, setSessionResult] = useState(null)

  const handleStart = (newConfig) => {
    setConfig(newConfig)
    setScreen('session')
  }

  const handleFinish = (result) => {
    setSessionResult(result)
    setScreen('report')
  }

  const handleReset = () => {
    setConfig(null)
    setSessionResult(null)
    setScreen('setup')
  }

  return (
    <Layout onReset={screen !== 'setup' ? handleReset : null}>
      {screen === 'setup' && <Setup onStart={handleStart} />}
      {screen === 'session' && config && (
        <Session config={config} onFinish={handleFinish} />
      )}
      {screen === 'report' && sessionResult && (
        <Report result={sessionResult} onRestart={handleReset} />
      )}
    </Layout>
  )
}

export default App