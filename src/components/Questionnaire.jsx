import { useMemo, useState, useRef, useEffect } from 'react'
import { derive } from '../engine/derive.js'
import { visibleQuestions } from '../data/questions.js'
import { IconArrowL, IconArrowR, IconLock } from './icons.jsx'

export default function Questionnaire({ onFinish, onExit }) {
  const [answers, setAnswers] = useState({})
  const [index, setIndex] = useState(0)

  const visible = useMemo(() => visibleQuestions(answers, derive(answers)), [answers])
  const idx = Math.min(index, visible.length - 1)
  const q = visible[idx]
  const prev = idx > 0 ? visible[idx - 1] : null
  const newStage = prev && prev.stage !== q.stage

  const total = visible.length
  const percent = Math.min(99, Math.round((idx / Math.max(1, total)) * 100))

  function commit(value) {
    const na = { ...answers, [q.id]: value }
    const nv = visibleQuestions(na, derive(na))
    const pos = nv.findIndex((x) => x.id === q.id)
    setAnswers(na)
    if (pos >= 0 && pos + 1 < nv.length) setIndex(pos + 1)
    else onFinish(na)
  }

  function back() {
    if (idx === 0) { onExit(); return }
    setIndex(idx - 1)
  }

  return (
    <div className="quiz-wrap">
      <div className="quiz-top">
        <div className="container quiz-top-inner">
          <span className="brand" style={{ fontSize: 16 }}>
            <span className="brand-mark" style={{ width: 30, height: 30 }}>
              <svg viewBox="0 0 24 24" fill="none" style={{ width: 18, height: 18 }}>
                <path d="M12 21s-7-4.5-7-9.5A3.6 3.6 0 0 1 12 9a3.6 3.6 0 0 1 7 2.5C19 16.5 12 21 12 21z" stroke="#bcdcff" strokeWidth="1.8" strokeLinejoin="round" />
              </svg>
            </span>
          </span>
          <div className="progress-wrap">
            <div className="progress-cap">Собираем вашу модель организма по ответам · {percent}%</div>
            <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
          </div>
          <span className="progress-meta">{idx + 1} / {total}</span>
          <button className="exit-link" onClick={onExit}>Выйти</button>
        </div>
      </div>

      <div className="quiz-body">
        <div className="qcard fade-in" key={q.id}>
          {newStage && <div className="section-flag">Новый раздел · {q.stage}</div>}
          <div className="q-stage">{q.stage}</div>
          <h2 className="q-title">{q.title}</h2>
          {q.help && <p className="q-help">{q.help}</p>}

          {q.type === 'single' ? (
            <div className="opts">
              {q.options.map((opt) => (
                <button
                  key={opt.value}
                  className={`opt ${answers[q.id] === opt.value ? 'selected' : ''}`}
                  onClick={() => commit(opt.value)}
                >
                  <span className="mark" />
                  {opt.label}
                </button>
              ))}
            </div>
          ) : (
            <NumberField q={q} value={answers[q.id]} onSubmit={commit} />
          )}

          <div className="q-nav">
            <button className="back-btn" onClick={back}>
              <IconArrowL style={{ width: 17, height: 17 }} /> {idx === 0 ? 'На главную' : 'Назад'}
            </button>
            <span className="q-hint"><IconLock style={{ width: 13, height: 13, verticalAlign: '-2px' }} /> Ответы анонимны</span>
          </div>
        </div>
      </div>
    </div>
  )
}

function NumberField({ q, value, onSubmit }) {
  const [val, setVal] = useState(value ?? '')
  const ref = useRef(null)
  useEffect(() => { ref.current?.focus() }, [q.id])
  useEffect(() => { setVal(value ?? '') }, [q.id])

  const n = Number(val)
  const valid = val !== '' && Number.isFinite(n) &&
    (q.min === undefined || n >= q.min) && (q.max === undefined || n <= q.max)

  return (
    <form onSubmit={(e) => { e.preventDefault(); if (valid) onSubmit(n) }}>
      <div className="q-number-input">
        <input
          ref={ref}
          type="number"
          inputMode="decimal"
          step={q.step || 1}
          value={val}
          placeholder="—"
          onChange={(e) => setVal(e.target.value)}
        />
        <span className="unit">{q.unit}</span>
      </div>
      {q.min !== undefined && (
        <p className="q-hint" style={{ marginTop: 10 }}>Допустимо от {q.min} до {q.max} {q.unit}</p>
      )}
      <div style={{ marginTop: 26 }}>
        <button type="submit" className="btn btn-primary btn-lg" disabled={!valid}>
          Продолжить <IconArrowR style={{ width: 18, height: 18 }} />
        </button>
      </div>
    </form>
  )
}
