import { useEffect, useRef, useState } from 'react'
import BodyFigure from './BodyFigure.jsx'
import { anatomyKey } from '../engine/anatomyPrompt.js'

const STEPS = [
  'Анализируем ваши ответы…',
  'Сопоставляем с органами и системами…',
  'Формируем модель вашего организма…',
  'Отрисовываем органы под ваш профиль…',
  'Почти готово…',
]

// Renders the personalized AI anatomy image. While it generates (~30–60s)
// shows a scanning loader. Falls back to the interactive SVG figure on error.
export default function AnatomyView({ organs, demographics, selected, onSelect }) {
  const [status, setStatus] = useState('loading') // loading | done | error
  const [image, setImage] = useState(null)
  const [step, setStep] = useState(0)
  const key = anatomyKey(organs, demographics)
  const startedRef = useRef(null)

  useEffect(() => {
    if (startedRef.current === key) return
    startedRef.current = key

    // No backend configured → show the curated realistic render (calm, no per-user
    // generation). The personalized parametric body replaces this once it's built.
    const API_BASE = import.meta.env.VITE_API_BASE || ''
    // sex/build-specific bodies need the parametric system (OpenAI blocks realistic
    // female anatomy); use the curated realistic render for now.
    if (!API_BASE) { setImage('/anatomy/base-healthy.png?v=4'); setStatus('done'); return }

    setStatus('loading'); setImage(null); setStep(0)

    const ctrl = new AbortController()
    const t = setInterval(() => setStep((s) => Math.min(STEPS.length - 1, s + 1)), 9000)

    fetch(`${import.meta.env.VITE_API_BASE || ''}/api/anatomy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organs: organs.map((o) => ({ id: o.id, state: o.state, severity: o.severity })), demographics }),
      signal: ctrl.signal,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('bad status ' + r.status))))
      .then((d) => {
        if (!d.image) throw new Error('no image')
        setImage(d.image); setStatus('done')
      })
      .catch((e) => { if (e.name !== 'AbortError') { console.warn('anatomy gen failed:', e.message); setStatus('error') } })
      .finally(() => clearInterval(t))

    return () => { clearInterval(t); ctrl.abort() }
  }, [key])

  if (status === 'error') {
    return (
      <div className="anatomy-stage anatomy-stage--fallback">
        <span className="bf-stage-label"><span className="d" /> Карта органов</span>
        <BodyFigure organs={organs} selected={selected} onSelect={onSelect} interactive />
        <div className="bf-legend"><i className="lg-h">Норма</i><i className="lg-w">Внимание</i><i className="lg-r">Риск</i></div>
      </div>
    )
  }

  return (
    <div className="anatomy-stage">
      <span className="bf-stage-label"><span className="d" /> {status === 'done' ? 'Ваш организм' : 'Генерация модели'}</span>

      {status === 'done' ? (
        <>
          <img className="anatomy-img" src={image} alt="Персональная анатомическая модель по вашим ответам"
            onError={(e) => { if (!e.currentTarget.src.includes('base-healthy')) e.currentTarget.src = '/anatomy/base-healthy.png?v=4' }} />
          <span className="anatomy-scan" />
          <span className="anatomy-glow" />
        </>
      ) : (
        <div className="anatomy-loader">
          <div className="anatomy-loader-orbit"><span /><span /><span /></div>
          <div className="anatomy-loader-bar"><i /></div>
          <div className="anatomy-loader-step">{STEPS[step]}</div>
          <div className="anatomy-loader-note">Создаём изображение ваших органов — это занимает до минуты</div>
        </div>
      )}
    </div>
  )
}
