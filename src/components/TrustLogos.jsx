import { useState } from 'react'
import { useI18n } from '../i18n.jsx'

// Real logo files live in /public/logos/trust/.
const PARTNERS = [
  { file: 'World_Health_Organization_Logo.svg.png', name: 'ВОЗ', note: 'World Health Organization' },
  { file: 'cdc-logo-tag-right.svg', name: 'CDC', note: 'Centers for Disease Control' },
  { file: '5.webp', name: 'PubMed', note: 'Доказательная база' },
  { file: '2-1.webp', name: 'AEMPS', note: 'Агентство лекарств Испании' },
  { file: 'PRIMERA-ARTICULACION-COLOR-CMYK_ok-scaled.webp', name: 'Universitas Miguel Hernández', note: 'Университет-партнёр' },
  { file: '40-1.webp', name: 'Parque Científico UMH', note: 'Научный парк' },
  { file: 'images.webp', name: 'Santander X', note: 'Программа инноваций' },
  { file: 'AF_CLARKEMODET_VP_POS_RGB.webp', name: 'Clarke Modet', note: 'Интеллектуальная собственность' },
]


function Logo({ p }) {
  const [broken, setBroken] = useState(false)
  if (broken) return null
  return (
    <div className="logo-mark" title={`${p.name} — ${p.note}`}>
      <img src={`/logos/trust/${p.file}`} alt={p.name} loading="lazy" onError={() => setBroken(true)} />
    </div>
  )
}

export default function TrustLogos() {
  const { t } = useI18n()
  const STATS = [
    { n: '240 000+', l: t('trust.stat1') },
    { n: t('trust.stat2n'), l: t('trust.stat2') },
    { n: '8', l: t('trust.stat3') },
  ]
  return (
    <section className="trust">
      <div className="container trust-inner">
        <div className="trust-stats">
          {STATS.map((s) => (
            <div className="trust-stat" key={s.l}>
              <div className="n">{s.n}</div>
              <div className="l">{s.l}</div>
            </div>
          ))}
        </div>

        <p className="trust-label">{t('trust.label')}</p>
        <div className="logo-wall">
          {PARTNERS.map((p) => <Logo key={p.file} p={p} />)}
        </div>
      </div>
    </section>
  )
}

export const SCIENCE_BASIS = [
  'SCORE2 · ESC',
  'FINDRISC',
  'AUDIT · ВОЗ',
  'Fagerström',
  'STOP-Bang',
  'STEADI · CDC',
  'DAST-10',
  'SEMFYC',
]
