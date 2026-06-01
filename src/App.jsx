import { useState, useCallback } from 'react'
import Landing from './components/Landing.jsx'
import Questionnaire from './components/Questionnaire.jsx'
import Passport from './components/Passport.jsx'

export default function App() {
  const [screen, setScreen] = useState('landing') // landing | quiz | result
  const [answers, setAnswers] = useState({})

  const start = useCallback(() => {
    setAnswers({})
    setScreen('quiz')
    window.scrollTo(0, 0)
  }, [])

  const finish = useCallback((finalAnswers) => {
    setAnswers(finalAnswers)
    setScreen('result')
    window.scrollTo(0, 0)
  }, [])

  const restart = useCallback(() => {
    setAnswers({})
    setScreen('landing')
    window.scrollTo(0, 0)
  }, [])

  if (screen === 'quiz') return <Questionnaire onFinish={finish} onExit={restart} />
  if (screen === 'result') return <Passport answers={answers} onRestart={restart} />
  return <Landing onStart={start} />
}
