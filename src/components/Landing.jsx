import TrustLogos, { SCIENCE_BASIS } from './TrustLogos.jsx'
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
  return (
    <div className="shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Brand />
          <div className="topbar-meta">
            <LangSwitcher />
            <span className="pill"><IconLock style={{ width: 15, height: 15 }} /> {t('nav.anon')}</span>
            <span className="pill"><IconClock style={{ width: 15, height: 15 }} /> {t('nav.time')}</span>
            <button className="btn btn-primary" style={{ padding: '12px 22px', fontSize: 15 }} onClick={onStart}>{t('nav.cta')}</button>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <span className="kbadge"><IconShield style={{ width: 14, height: 14 }} /> {t('hero.badge')}</span>
            <h1>{t('hero.h1a')} <em>{t('hero.h1em')}</em> {t('hero.h1b')}</h1>
            <p className="hero-lead">{t('hero.lead')}</p>
            <div className="hero-cta">
              <button className="btn btn-primary btn-lg" onClick={onStart}>
                {t('hero.cta')} <IconArrowR style={{ width: 18, height: 18 }} />
              </button>
              <span className="pill"><IconClock style={{ width: 15, height: 15 }} /> {t('hero.pill')}</span>
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><span className="n">9</span><span className="l">{t('hero.s1')}</span></div>
              <div className="hero-stat"><span className="n">8</span><span className="l">{t('hero.s2')}</span></div>
              <div className="hero-stat"><span className="n">100%</span><span className="l">{t('hero.s3')}</span></div>
            </div>
            <div className="hero-reassure">
              <span className="dot"><IconShield /> {t('hero.r1')}</span>
              <span className="dot"><IconLock /> {t('hero.r2')}</span>
              <span className="dot"><IconHeart /> {t('hero.r3')}</span>
            </div>
          </div>

          <div className="hero-stage">
            <div className="hero-glow" />
            <div className="float-card fc-1">
              <div className="fc-row">
                <span className="fc-ic green"><IconHeart /></span>
                <div><div className="fc-k">{t('hero.fc1t')}</div><div className="fc-v">{t('hero.fc1v')}</div></div>
              </div>
            </div>
            <div className="float-card fc-2">
              <div className="fc-row">
                <span className="fc-ic gold"><IconChart /></span>
                <div><div className="fc-k">{t('hero.fc2t')}</div><div className="fc-v">86<small> / 100</small></div></div>
              </div>
            </div>
            <div className="float-card fc-3">
              <div className="fc-row">
                <span className="fc-ic green"><IconLeaf /></span>
                <div><div className="fc-k">{t('hero.fc3t')}</div><div className="fc-v"><small>{t('hero.fc3v')}</small> {t('hero.fc3s')}</div></div>
              </div>
            </div>
            <div className="anatomy-stage">
              <span className="ex-tag ex-tag--dark">{t('exampleTag')}</span>
              <span className="bf-stage-label"><span className="d" /> {t('hero.scan')}</span>
              <img className="anatomy-img" src="/anatomy/base-healthy.png?v=2" alt={t('hero.scan')} />
              <span className="anatomy-scan" />
              <span className="anatomy-glow" />
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
            <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-.035em', fontSize: 'clamp(30px,3.6vw,44px)', marginTop: 18, lineHeight: 1.06 }}>
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
          <h2 style={{ fontFamily: 'var(--font-sans)', fontWeight: 800, letterSpacing: '-.035em', fontSize: 'clamp(32px,4vw,50px)', marginTop: 18, lineHeight: 1.04 }}>{t('finalCta.h2')}</h2>
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
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{t('footer.method')}</p>
                <p style={{ fontSize: 13 }}>SCORE2 · FINDRISC<br />AUDIT · STOP-Bang<br />STEADI · DAST-10</p>
              </div>
              <div>
                <p style={{ color: '#fff', fontWeight: 700, fontSize: 13, marginBottom: 12 }}>{t('footer.privacy')}</p>
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
          style={{ fontFamily: 'var(--font-display)', fontSize: 56, fontWeight: 700, fill: 'var(--emerald-800)' }}>
          {value}
        </text>
      )}
    </svg>
  )
}
