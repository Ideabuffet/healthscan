import { useMemo, useState } from 'react'
import { buildPassport } from '../engine/recommendations.js'
import { buildBodyMap } from '../engine/bodyMap.js'
import AnatomyView from './AnatomyView.jsx'
import { IconCheck, IconAlert, IconPrint, IconRefresh, IconArrowR } from './icons.jsx'

const CATEGORY_ORDER = [
  'Сердце, сосуды и обмен веществ',
  'Образ жизни и зависимости',
  'Возраст и онко-настороженность',
]

export default function Passport({ answers, onRestart }) {
  const data = useMemo(() => buildPassport(answers), [answers])
  const { bio, summary, modules, lifestyle, redFlag } = data
  const code = useMemo(() => 'HS-' + Math.random().toString(36).slice(2, 7).toUpperCase(), [])
  const date = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })

  const deltaYounger = bio.delta < 0
  const deltaZero = bio.delta === 0
  const upFactors = bio.factors.filter((f) => f.dir === 'up').slice(0, 3)
  const downFactors = bio.factors.filter((f) => f.dir === 'down').slice(0, 2)

  const grouped = CATEGORY_ORDER
    .map((cat) => ({ cat, items: modules.filter((m) => m.category === cat) }))
    .filter((g) => g.items.length)

  return (
    <div className="passport-page">
      <div className="passport">
        {/* HEAD */}
        <div className="pp-head">
          <div className="pp-head-row">
            <div>
              <div className="pp-doc-label">Персональный документ</div>
              <div className="pp-title">Паспорт здоровья</div>
              <div className="pp-meta">
                <span>№ {code}</span>
                <span>Выдан {date}</span>
                <span>{bio.realAge} лет · {summary.reviewed} модулей оценки</span>
              </div>
            </div>
            <div className="pp-seal">HEALTH<br />SCAN<br />✓</div>
          </div>
        </div>

        {/* INTERACTIVE BODY MAP */}
        <BodyMapSection data={data} answers={answers} />

        {/* BIO AGE */}
        <div className="pp-bioage">
          <ResultRing score={bio.healthScore} center={bio.bioAge} />
          <div className="bioage-copy">
            <h3>Ваш биологический возраст</h3>
            <p className="delta-line">
              {deltaZero ? (
                <>Он совпадает с вашим реальным возрастом <b>{bio.realAge}</b> лет.</>
              ) : (
                <>
                  Это на <b className={deltaYounger ? 'delta-younger' : 'delta-older'}>
                    {Math.abs(bio.delta)} {plural(Math.abs(bio.delta))}
                  </b>{' '}
                  {deltaYounger ? 'меньше' : 'больше'} вашего реального возраста ({bio.realAge}).
                </>
              )}
            </p>
            <p>
              Биологический возраст переводит ваши факторы риска в один показатель. Хорошая новость:
              большинство из них можно изменить — и при повторном прохождении увидеть прогресс.
            </p>
            <div className="bioage-factors">
              {upFactors.map((f) => <span key={f.label} className="factor-tag up">↑ {f.label}</span>)}
              {downFactors.map((f) => <span key={f.label} className="factor-tag down">↓ {f.label}</span>)}
            </div>
          </div>
        </div>

        {/* SUMMARY */}
        <div className="pp-summary">
          <div className="pp-sum-item"><div className="k">Индекс здоровья</div><div className="v">{bio.healthScore}<span style={{ fontSize: 15, color: 'var(--ink-muted)' }}> / 100</span></div></div>
          <div className="pp-sum-item"><div className="k">Требуют внимания</div><div className="v">{summary.attention}</div></div>
          <div className="pp-sum-item"><div className="k">Приоритетных</div><div className="v">{summary.priority}</div></div>
        </div>

        {/* BODY */}
        <div className="pp-body">
          {redFlag?.any && (
            <div className="redflag-note">
              <span className="ic"><IconAlert style={{ width: 22, height: 22 }} /></span>
              <div>
                <b>Стоит обратиться к врачу в ближайшее время</b>
                <p>Вы отметили симптомы, которые важно показать специалисту — без паники, но не откладывая. Это не диагноз; цель — не пропустить то, что требует оценки.</p>
              </div>
            </div>
          )}

          <div className="pp-section-title">Профиль здоровья</div>
          <p className="pp-section-sub">Разбор по модулям с персональными рекомендациями. Каждый блок оценивался по валидированной шкале.</p>

          {grouped.map((g) => (
            <div key={g.cat}>
              <div className="cat-divider"><span className="label">{g.cat}</span><span className="line" /></div>
              {g.items.map((m) => <ModuleCard key={m.key} m={m} />)}
            </div>
          ))}

          {lifestyle.length > 0 && (
            <>
              <div className="cat-divider" style={{ marginTop: 34 }}><span className="label">Рекомендации по образу жизни</span><span className="line" /></div>
              <div className="rmod">
                <ul className="rmod-recs">
                  {lifestyle.map((l, i) => (
                    <li key={i}>
                      <span className="tick"><IconCheck /></span>
                      <span><b style={{ color: 'var(--ink)' }}>{l.topic}.</b> {l.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>

        {/* ACTIONS */}
        <div className="pp-actions">
          <button className="btn btn-primary" onClick={() => window.print()}>
            <IconPrint style={{ width: 18, height: 18 }} /> Сохранить / распечатать
          </button>
          <button className="btn btn-ghost" onClick={onRestart}>
            <IconRefresh style={{ width: 18, height: 18 }} /> Пройти заново
          </button>
        </div>
      </div>

      <p className="pp-disclaimer">
        HealthScan не ставит медицинских диагнозов и не заменяет консультацию врача. Биологический возраст и индекс
        здоровья — ориентировочные показатели на основе ваших ответов. Результаты носят профилактический характер.
        При тревожных симптомах обратитесь к специалисту.
      </p>
    </div>
  )
}

const STATE_RU = { healthy: 'В норме', watch: 'Под наблюдением', risk: 'Внимание' }
const METER_COLOR = { healthy: 'linear-gradient(90deg,#5ba8f3,#1d4fa0)', watch: 'linear-gradient(90deg,#ffce85,#d4902a)', risk: 'linear-gradient(90deg,#ff9a8c,#c8392b)' }

function BodyMapSection({ data, answers }) {
  const map = useMemo(() => buildBodyMap(data, answers), [data, answers])
  const [sel, setSel] = useState(map.worst)
  const organ = map.organs.find((o) => o.id === sel) || map.organs[0]
  const concerns = map.organs.filter((o) => o.state !== 'healthy').length

  return (
    <div className="pp-bodymap">
      <AnatomyView organs={map.organs} demographics={map.demographics} selected={sel} onSelect={setSel} />

      <div className="bf-panel">
        <div className="pp-section-title">Ваше тело изнутри</div>
        <p className="pp-section-sub">
          {concerns > 0
            ? `Мы перевели ваши ответы в состояние органов. ${concerns} ${plural2(concerns)} стоит уделить внимание — нажмите на орган.`
            : 'Мы перевели ваши ответы в состояние органов. Выраженных факторов риска не выявлено — нажмите на орган, чтобы увидеть, как сохранить результат.'}
        </p>

        <div className="bf-organ-tabs">
          {map.organs.map((o) => (
            <button key={o.id} className={`bf-tab s-${o.state} ${o.id === sel ? 'active' : ''}`} onClick={() => setSel(o.id)}>
              <span className="d" /> {o.label.split(' ')[0]}
            </button>
          ))}
        </div>

        <div className="bf-card">
          <div className="bf-card-top">
            <div>
              <h4>{organ.label}</h4>
              <div className="sub">{organ.sub}</div>
            </div>
            <span className={`bf-state-badge s-${organ.state}`}>{STATE_RU[organ.state]}</span>
          </div>

          <div className="bf-meter"><i style={{ width: `${organ.score}%`, background: METER_COLOR[organ.state] }} /></div>
          <div className="bf-meter-cap">Состояние · {organ.headline}</div>

          {organ.findings.length > 0 && (
            <div className="bf-findings">
              {organ.findings.map((f, i) => (
                <span key={i} className={`bf-finding ${organ.state === 'watch' ? 'w' : ''}`}>{f}</span>
              ))}
            </div>
          )}

          <div className="bf-todo-h">{organ.state === 'healthy' ? 'Как сохранить' : 'Что делать'}</div>
          <ul className="bf-todo">
            {organ.recs.map((r, i) => (
              <li key={i}><span className="tick"><IconCheck /></span><span>{r}</span></li>
            ))}
          </ul>

          <div className="bf-hint"><IconAlert style={{ width: 15, height: 15 }} /> Это профилактический ориентир, а не диагноз.</div>
        </div>
      </div>
    </div>
  )
}

function plural2(n) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'органу'
  return 'органам'
}

function ModuleCard({ m }) {
  return (
    <div className="rmod">
      <div className="rmod-head">
        <div>
          <div className="name">{m.name}</div>
          <div className="full">{m.full}</div>
        </div>
        <span className={`level-badge ${levelClass(m.level)}`}>{m.levelLabel}</span>
      </div>
      <div className="rmod-metric">
        <span className="big">{m.metric}</span>
        <span className="small">{m.metricNote}</span>
      </div>
      <div className="rmod-bar"><i style={{ width: `${Math.max(4, m.barPct)}%`, background: m.barColor }} /></div>
      <ul className="rmod-recs">
        {m.recs.map((r, i) => (
          <li key={i}><span className="tick"><IconCheck /></span><span>{r}</span></li>
        ))}
      </ul>
    </div>
  )
}

function ResultRing({ score, center }) {
  const size = 168, stroke = 14
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0.04, Math.min(1, score / 100))
  const col = score >= 70 ? '#1c7a4d' : score >= 45 ? '#b8860b' : '#b23a2e'
  return (
    <div className="ring">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--emerald-100)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={col} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      </svg>
      <div className="center">
        <div className="num">{center}</div>
        <div className="cap">биол. возраст</div>
      </div>
    </div>
  )
}

function levelClass(l) {
  return l === 'low' ? 'lvl-low' : l === 'mod' ? 'lvl-mod' : l === 'high' ? 'lvl-high' : 'lvl-info'
}
function plural(n) {
  const m10 = n % 10, m100 = n % 100
  if (m10 === 1 && m100 !== 11) return 'год'
  if (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20)) return 'года'
  return 'лет'
}
