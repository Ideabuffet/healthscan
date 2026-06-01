import TrustLogos, { SCIENCE_BASIS, PARTNERS } from './TrustLogos.jsx'
import { useI18n, LANGS } from '../i18n.jsx'
import {
  IconHeart, IconShield, IconClock, IconLock, IconList, IconDoc, IconChart,
  IconHourglass, IconArrowR, IconCheck, IconCross, IconLeaf,
} from './icons.jsx'

function Brand() {
  return (
    <div className="brand">
      <span className="brand-mark">
        <svg viewBox="0 0 24 24" fill="none">
          <path d="M12 21s-7-4.5-7-9.5A3.6 3.6 0 0 1 12 9a3.6 3.6 0 0 1 7 2.5C19 16.5 12 21 12 21z" stroke="#bcdcff" strokeWidth="1.8" strokeLinejoin="round"/>
          <path d="M6 13h3l1.5-3 2.5 6 1.5-3H18" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </span>
      <span>Health<b>Scan</b></span>
    </div>
  )
}

// ---- systems shown around the body (landing showcase · example scores) ----
const SYS_LEFT = ['brain', 'heart', 'lungs', 'digestive', 'immune']
const SYS_RIGHT = ['muscles', 'endocrine', 'kidneys', 'skin', 'index']
const SYS_DATA = {
  brain: { score: 92, tone: 'good', c: '#6ea8ff' }, heart: { score: 76, tone: 'good', c: '#ff7a7a' },
  lungs: { score: 88, tone: 'good', c: '#a78bfa' }, digestive: { score: 64, tone: 'warn', c: '#e3aa45' },
  immune: { score: 82, tone: 'good', c: '#34d399' }, muscles: { score: 62, tone: 'warn', c: '#e3aa45' },
  endocrine: { score: 79, tone: 'good', c: '#f0a8c8' }, kidneys: { score: 91, tone: 'good', c: '#f0a8c8' },
  skin: { score: 58, tone: 'warn', c: '#d8a878' }, index: { score: 86, tone: 'gold', c: '#e3aa45' },
}
const SYS_T = {
  ru: { brain: ['Мозг и нервная система', 'Оптимально'], heart: ['Сердце и сосуды', 'Низкий риск'], lungs: ['Дыхательная система', 'Хорошее состояние'], digestive: ['Пищеварительная система', 'Есть нагрузка'], immune: ['Иммунная система', 'Стабильно'], muscles: ['Опорно-двигательная система', 'Есть нагрузка'], endocrine: ['Эндокринная система', 'В пределах нормы'], kidneys: ['Мочевыделительная система', 'Оптимально'], skin: ['Кожа', 'Требует внимания'], index: ['Индекс здоровья', 'Общее состояние'] },
  en: { brain: ['Brain & nervous system', 'Optimal'], heart: ['Heart & vessels', 'Low risk'], lungs: ['Respiratory system', 'Good condition'], digestive: ['Digestive system', 'Under strain'], immune: ['Immune system', 'Stable'], muscles: ['Musculoskeletal system', 'Under strain'], endocrine: ['Endocrine system', 'Within range'], kidneys: ['Urinary system', 'Optimal'], skin: ['Skin', 'Needs attention'], index: ['Health index', 'Overall state'] },
  es: { brain: ['Cerebro y s. nervioso', 'Óptimo'], heart: ['Corazón y vasos', 'Riesgo bajo'], lungs: ['Sistema respiratorio', 'Buen estado'], digestive: ['Sistema digestivo', 'Bajo presión'], immune: ['Sistema inmunitario', 'Estable'], muscles: ['Sistema musculoesquelético', 'Bajo presión'], endocrine: ['Sistema endocrino', 'En rango'], kidneys: ['Sistema urinario', 'Óptimo'], skin: ['Piel', 'Requiere atención'], index: ['Índice de salud', 'Estado general'] },
}
function SysIcon({ id }) {
  const p = {
    brain: 'M12 5c-2 0-3 1.4-3 3 0 .6.2 1.1.5 1.6C8.6 10 8 10.9 8 12c0 1.3.9 2.4 2.1 2.7M12 5c2 0 3 1.4 3 3 0 .6-.2 1.1-.5 1.6.9.4 1.5 1.3 1.5 2.4 0 1.3-.9 2.4-2.1 2.7M12 5v12.5',
    heart: 'M12 20s-7-4.5-7-9.5A3.6 3.6 0 0 1 12 8a3.6 3.6 0 0 1 7 2.5C19 15.5 12 20 12 20z',
    lungs: 'M12 4v6M9.5 10c-2 1-3.5 3-3.5 6 0 2 1 3 2.5 3S11 17 11 15v-3a2 2 0 0 0-1.5-2zM14.5 10c2 1 3.5 3 3.5 6 0 2-1 3-2.5 3S13 17 13 15v-3a2 2 0 0 1 1.5-2z',
    digestive: 'M10 5v4c0 2 2 2 2 4s-2 2-2 4M14 6c2 1 3 3 3 6s-3 5-6 5',
    immune: 'M12 4l6 2v5c0 4-3 6-6 7-3-1-6-3-6-7V6l6-2z',
    muscles: 'M6 6l2 2M16 16l2 2M5 9l4-4M15 19l4-4M8 8l8 8',
    endocrine: 'M12 6c-2 0-4 2-4 4s2 4 4 4M12 6c2 0 4 2 4 4s-2 4-4 4M12 6v12',
    kidneys: 'M9.5 7c-2 0-3 2-3 5s1 5 3 5c1 0 1.5-1 1.3-2.5C10.5 16 9.5 14 10 12s1.5-5-.5-5zM14.5 7c2 0 3 2 3 5s-1 5-3 5c-1 0-1.5-1-1.3-2.5C13.5 16 14.5 14 14 12s-1.5-5 .5-5z',
    skin: 'M5 8h14M5 12h14M5 16h14',
    index: 'M5 19V5M5 19h14M8 16v-4M12 16V9M16 16v-7',
  }[id] || 'M12 5v14'
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={p} /></svg>
}
function SysCard({ id, side, lang }) {
  const d = SYS_DATA[id]
  const [name, status] = (SYS_T[lang] || SYS_T.ru)[id]
  return (
    <div className={`sys-card sys-${side}`}>
      <span className="sys-conn" /><span className="sys-dot" style={{ '--dot': d.c }} />
      <span className="sys-ic" style={{ color: d.c }}><SysIcon id={id} /></span>
      <div className="sys-body">
        <div className="sys-name">{name}</div>
        <div className="sys-row">
          <span className={`sys-status t-${d.tone}`}>{status}</span>
          <span className="sys-score">{d.score}<small>/100</small></span>
        </div>
      </div>
    </div>
  )
}

export function LangSwitcher() {
  const { lang, setLang } = useI18n()
  return (
    <div className="lang-switch" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button key={l.code} className={`lang-opt ${lang === l.code ? 'active' : ''}`} onClick={() => setLang(l.code)} title={l.name}>
          {l.label}
        </button>
      ))}
    </div>
  )
}

export default function Landing({ onStart }) {
  const { t, lang } = useI18n()
  const younger = lang === 'ru' ? '−5 лет моложе' : lang === 'en' ? '−5 years younger' : '−5 años más joven'
  const L = lang === 'en' || lang === 'es' ? lang : 'ru'
  const scanBadge = { ru: 'Научный анализ на основе ИИ и валидированных методик', en: 'AI-based scientific analysis & validated methods', es: 'Análisis científico con IA y métodos validados' }[L]
  const scanCap = { ru: 'Сканирование организма на основе ваших ответов', en: 'Scanning your body from your answers', es: 'Escaneo de tu cuerpo según tus respuestas' }[L]
  const FEATURES = {
    ru: [['Научный подход', 'Методики ВОЗ, CDC, SEMFYC'], ['100% анонимно', 'Ваши данные под защитой'], ['Персональные рекомендации', 'Индивидуальные советы'], ['Быстро и удобно', 'Результат за 10–15 минут']],
    en: [['Scientific approach', 'WHO, CDC, SEMFYC methods'], ['100% anonymous', 'Your data is protected'], ['Personal recommendations', 'Individual advice'], ['Fast & easy', 'Result in 10–15 minutes']],
    es: [['Enfoque científico', 'Métodos OMS, CDC, SEMFYC'], ['100% anónimo', 'Tus datos protegidos'], ['Recomendaciones personales', 'Consejos individuales'], ['Rápido y fácil', 'Resultado en 10–15 min']],
  }[L]
  const FIC = [IconShield, IconLock, IconChart, IconClock]
  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand-wrap"><Brand /><span className="by-dana">by Dana&nbsp;Assist</span></div>
          <div className="topbar-meta">
            <LangSwitcher />
            <span className="pill"><IconLock style={{ width: 15, height: 15 }} /> {t('nav.anon')}</span>
            <span className="pill"><IconClock style={{ width: 15, height: 15 }} /> {t('nav.time')}</span>
            <button className="btn btn-primary" style={{ padding: '12px 22px', fontSize: 15 }} onClick={onStart}>{t('nav.cta')}</button>
          </div>
        </div>
      </header>

      {/* HERO — scan: body centered, system cards around it */}
      <section className="hero hero--scan">
        <div className="container">
          <div className="scan-head">
            <span className="scan-badge"><IconShield style={{ width: 13, height: 13 }} /> {scanBadge}</span>
            <h1>{t('hero.h1a')} <em>{t('hero.h1em')}</em> {t('hero.h1b')}</h1>
            <p className="scan-lead">{t('hero.lead')}</p>
          </div>

          <div className="scan-stage">
            <div className="scan-col scan-col-l">
              {SYS_LEFT.map((id) => <SysCard key={id} id={id} side="l" lang={L} />)}
            </div>

            <div className="scan-body">
              <span className="ex-tag ex-tag--dark">{t('exampleTag')}</span>
              <img className="anatomy-img" src="/anatomy/base-healthy.png?v=4" alt={t('hero.scan')} />
              <span className="scan-pedestal" />
            </div>

            <div className="scan-col scan-col-r">
              {SYS_RIGHT.map((id) => <SysCard key={id} id={id} side="r" lang={L} />)}
            </div>
          </div>

          <div className="scan-caption"><IconShield style={{ width: 14, height: 14 }} /> {scanCap}</div>

          <div className="scan-features">
            {FEATURES.map(([t1, t2], i) => {
              const Ic = FIC[i]
              return (
                <div className="scan-feat" key={i}>
                  <span className="scan-feat-ic"><Ic style={{ width: 18, height: 18 }} /></span>
                  <div><div className="scan-feat-t">{t1}</div><div className="scan-feat-s">{t2}</div></div>
                </div>
              )
            })}
          </div>

          <div className="hero-logos">
            <span className="hero-logos-label">{t('trust.label')}</span>
            <div className="hero-logos-row">
              {PARTNERS.map((p) => (
                <span className="hl-mark" key={p.file}><img src={`/logos/trust/${p.file}`} alt={p.name} loading="lazy" /></span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustLogos />

      {/* WHY PREVENTION */}
      <section className="why section">
        <div className="container">
          <div className="head">
            <span className="eyebrow">{t('why.eyebrow')}</span>
            <h2>{t('why.h2')}</h2>
            <p className="why-lead">{t('why.lead')}</p>
          </div>
          <div className="why-split">
            <div className="why-col bad">
              <h3>{t('why.badT')}</h3>
              <ul className="why-list bad">
                {['bad1', 'bad2', 'bad3', 'bad4'].map((k) => (
                  <li key={k}><span className="ic"><IconCross style={{ width: 13, height: 13 }} /></span> {t('why.' + k)}</li>
                ))}
              </ul>
            </div>
            <div className="why-col">
              <h3>{t('why.goodT')}</h3>
              <ul className="why-list good">
                {['good1', 'good2', 'good3', 'good4'].map((k) => (
                  <li key={k}><span className="ic"><IconCheck style={{ width: 13, height: 13 }} /></span> {t('why.' + k)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <div className="container">
          <div className="head center">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('steps.eyebrow')}</span>
            <h2>{t('steps.h2')}</h2>
          </div>
          <div className="steps">
            <Step num="01" icon={<IconList />} title={t('steps.s1t')} text={t('steps.s1d')} />
            <Step num="02" icon={<IconChart />} title={t('steps.s2t')} text={t('steps.s2d')} />
            <Step num="03" icon={<IconDoc />} title={t('steps.s3t')} text={t('steps.s3d')} />
          </div>
        </div>
      </section>

      {/* WHAT WE ASSESS */}
      <section className="section-tight" style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="head center">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('mods.eyebrow')}</span>
            <h2>{t('mods.h2')}</h2>
          </div>
          <div className="mods">
            {t('mods.list').map((m, i) => <Mod key={i} t={m.t} p={m.p} />)}
          </div>
          <p className="trust-label" style={{ marginTop: 40 }}>{t('mods.label')}</p>
          <div className="sci-row">
            {SCIENCE_BASIS.map((s) => <span key={s} className="pill">{s}</span>)}
          </div>
        </div>
      </section>

      {/* BIO AGE FEATURE */}
      <section className="feature section">
        <div className="container feature-grid">
          <div>
            <span className="eyebrow">{t('feature.eyebrow')}</span>
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, letterSpacing: '-.035em', fontSize: 'clamp(30px,3.6vw,44px)', marginTop: 18, lineHeight: 1.06 }}>
              {t('feature.h2')}
            </h2>
            <p style={{ color: 'var(--ink-soft)', fontSize: 17, marginTop: 16, maxWidth: '34em' }}>{t('feature.lead')}</p>
            <ul className="why-list good" style={{ marginTop: 22 }}>
              {['l1', 'l2', 'l3'].map((k) => (
                <li key={k}><span className="ic" style={{ background: 'var(--emerald-50)', color: 'var(--emerald-700)' }}><IconLeaf style={{ width: 13, height: 13 }} /></span><span style={{ color: 'var(--ink-soft)' }}>{t('feature.' + k)}</span></li>
              ))}
            </ul>
            <button className="btn btn-primary btn-lg" style={{ marginTop: 30 }} onClick={onStart}>
              {t('feature.cta')} <IconArrowR style={{ width: 18, height: 18 }} />
            </button>
          </div>
          <div className="gauge">
            <div className="gauge-card">
              <span className="ex-tag">{t('exampleTag')}</span>
              <BioRing value={34} big />
              <div className="lbl">{t('feature.gaugeLbl')}</div>
              <div className="cmp">{t('feature.gaugeCmp')}<b>{younger}</b></div>
            </div>
          </div>
        </div>
      </section>

      {/* WHAT YOU GET */}
      <section className="section-tight">
        <div className="container">
          <div className="head center">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('get.eyebrow')}</span>
            <h2>{t('get.h2')}</h2>
          </div>
          <div className="steps">
            <Step num="" icon={<IconDoc />} title={t('get.i1t')} text={t('get.i1d')} />
            <Step num="" icon={<IconChart />} title={t('get.i2t')} text={t('get.i2d')} />
            <Step num="" icon={<IconCheck />} title={t('get.i3t')} text={t('get.i3d')} />
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="section" style={{ textAlign: 'center' }}>
        <div className="container">
          <span className="eyebrow" style={{ justifyContent: 'center' }}><IconHourglass style={{ width: 15, height: 15 }} /> {t('finalCta.eyebrow')}</span>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 500, letterSpacing: '-.035em', fontSize: 'clamp(32px,4vw,50px)', marginTop: 18, lineHeight: 1.04 }}>{t('finalCta.h2')}</h2>
          <p style={{ color: 'var(--ink-soft)', fontSize: 18, marginTop: 16, maxWidth: '30em', margin: '16px auto 0' }}>{t('finalCta.p')}</p>
          <button className="btn btn-primary btn-lg" style={{ marginTop: 30 }} onClick={onStart}>
            {t('finalCta.cta')} <IconArrowR style={{ width: 18, height: 18 }} />
          </button>
          <p className="outcome-line">{t('outcome')}</p>
        </div>
      </section>

      {/* FAQ */}
      <section className="section-tight" style={{ background: 'var(--paper-2)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <div className="head center">
            <span className="eyebrow" style={{ justifyContent: 'center' }}>{t('faq.eyebrow')}</span>
            <h2>{t('faq.h2')}</h2>
          </div>
          <div className="faq-list">
            {[1, 2, 3, 4].map((i) => (
              <div className="faq-item" key={i}>
                <div className="faq-q">{t('faq.q' + i)}</div>
                <div className="faq-a">{t('faq.a' + i)}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <Brand />
              <p>{t('tag')}</p>
            </div>
            <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
              <div>
                <p style={{ color: '#fff', fontWeight: 500, fontSize: 13, marginBottom: 12 }}>{t('footer.method')}</p>
                <p style={{ fontSize: 13 }}>SCORE2 · FINDRISC<br />AUDIT · STOP-Bang<br />STEADI · DAST-10</p>
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 500, fontSize: 13, marginBottom: 12 }}>{t('footer.privacy')}</p>
                <p style={{ fontSize: 13 }}>{t('footer.priv1')}<br />{t('footer.priv2')}<br />{t('footer.priv3')}</p>
              </div>
            </div>
          </div>
          <p className="footer-disclaimer">{t('footer.disclaimer')}</p>
        </div>
      </footer>
    </div>
  )
}

function Step({ num, icon, title, text }) {
  return (
    <div className="step" data-n={num}>
      <div className="step-ic">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  )
}

function Mod({ t, p }) {
  return (
    <div className="modcard">
      <div className="t"><span className="d" /> {t}</div>
      <p>{p}</p>
    </div>
  )
}

export function BioRing({ value, big, mid }) {
  const size = big ? 230 : mid ? 132 : 96
  const stroke = big ? 16 : mid ? 11 : 9
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = 0.72
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--emerald-100)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="url(#bg1)" strokeWidth={stroke}
        strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
      <defs>
        <linearGradient id="bg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#338dee" />
          <stop offset="1" stopColor="#6c5ce7" />
        </linearGradient>
      </defs>
      {big && (
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
          transform={`rotate(90 ${size / 2} ${size / 2})`}
          style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 500, fill: 'var(--emerald-800)' }}>
          {value}
        </text>
      )}
    </svg>
  )
}
