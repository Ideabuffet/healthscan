// ============================================================
// BodyFigure — semi-transparent anatomical figure.
// Organs are tinted by health state and (optionally) clickable.
// Props:
//   organs:    [{ id, state, ... }]
//   selected:  organ id
//   onSelect:  (id) => void
//   interactive: boolean (hover/click affordances)
//   scan:      boolean (showcase scan animation, for landing)
// ============================================================

const STATE_FILL = {
  healthy: 'url(#og-healthy)',
  watch: 'url(#og-watch)',
  risk: 'url(#og-risk)',
}

// Organ shape geometry (viewBox 360 x 720). Each is drawn around its own
// coordinates; `pin` is the label dot / primary hit point.
const SHAPES = {
  brain: {
    pin: [180, 64],
    shape: (
      <path d="M163 44c-9 0-16 6-16 14 0 3 1 6 3 8-2 2-3 5-3 8 0 8 7 14 16 14h34c9 0 16-6 16-14 0-3-1-6-3-8 2-2 3-5 3-8 0-8-7-14-16-14a13 13 0 0 0-17 0z" />
    ),
    detail: <path className="bf-detail" d="M180 46v56M168 54c4 3 4 9 0 12M192 54c-4 3-4 9 0 12" />,
  },
  lungs: {
    pin: [180, 250],
    shape: (
      <path d="M174 214c-2 18-14 26-26 34-12 8-14 22-10 36 3 10 14 11 20 4 8-9 14-22 16-40zM186 214c2 18 14 26 26 34 12 8 14 22 10 36-3 10-14 11-20 4-8-9-14-22-16-40z" />
    ),
    detail: <path className="bf-detail" d="M180 210v44M156 244c6 2 10 6 12 12M204 244c-6 2-10 6-12 12" />,
  },
  heart: {
    pin: [178, 244],
    shape: (
      <path d="M180 232c-6-10-22-9-26 2-4 10 4 20 16 30l10 9 10-9c12-10 20-20 16-30-4-11-20-12-26-2z" transform="translate(-2 0)" />
    ),
    detail: null,
  },
  liver: {
    pin: [156, 318],
    shape: (
      <path d="M138 300c-12 0-22 4-26 12-4 9 2 18 14 22 18 6 40 6 56-2 8-4 8-14 2-20-12-10-30-14-46-12z" />
    ),
    detail: <path className="bf-detail" d="M120 312c20 6 42 6 60-2" />,
  },
  digestive: {
    pin: [188, 360],
    shape: (
      <path d="M176 336c-10 0-18 8-16 18 1 8 8 12 16 11 6 14 2 28-10 32-3 1-3 6 1 7 18 4 34-8 36-26 2-16-6-30-20-38-2-8-7-15-7-15z" />
    ),
    detail: <path className="bf-detail" d="M178 386c10 2 17 11 16 22" />,
  },
  kidneys: {
    pin: [150, 374],
    shape: (
      <path d="M146 356c-8 0-14 8-14 18s6 18 14 18c5 0 7-5 6-12-1-5-1-10 0-15 1-6-1-9-6-9zM214 356c8 0 14 8 14 18s-6 18-14 18c-5 0-7-5-6-12 1-5 1-10 0-15-1-6 1-9 6-9z" />
    ),
    detail: <path className="bf-detail" d="M146 365c4 3 5 12 0 18M214 365c-4 3-5 12 0 18" />,
  },
  muscles: {
    pin: [150, 520],
    shape: (
      <path d="M140 470c-9 0-15 10-15 26 0 30 4 60 8 84 2 10 14 10 16 0 4-24 8-54 8-84 0-16-7-26-16-26z" transform="translate(0 0)" />
    ),
    detail: <path className="bf-detail" d="M140 486c0 40 0 70-2 96M150 486c0 40 0 70 2 96" />,
  },
}

// Per-organ positional nudges (dx dy) to seat each organ anatomically
const T = {
  brain: [0, 2],
  lungs: [0, -46],
  heart: [-1, -32],
  liver: [-4, -58],
  digestive: [-2, -74],
  kidneys: [0, -80],
  muscles: [2, -72],
}

export default function BodyFigure({ organs, selected, onSelect, interactive = false, scan = false }) {
  const byId = {}
  ;(organs || []).forEach((o) => { byId[o.id] = o })

  // Render order: large/back organs first, small/front last
  const order = ['brain', 'liver', 'kidneys', 'digestive', 'lungs', 'heart', 'muscles']

  return (
    <svg className={`bf ${interactive ? 'bf--interactive' : ''}`} viewBox="0 0 360 720" role="img"
      aria-label="Карта здоровья по органам">
      <defs>
        <linearGradient id="bf-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#bcd8ff" stopOpacity=".34" />
          <stop offset="1" stopColor="#7aa6e6" stopOpacity=".16" />
        </linearGradient>
        <radialGradient id="og-healthy" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#6fd0e8" />
          <stop offset="1" stopColor="#2f7fd6" />
        </radialGradient>
        <radialGradient id="og-watch" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#ffd27a" />
          <stop offset="1" stopColor="#e0982a" />
        </radialGradient>
        <radialGradient id="og-risk" cx="40%" cy="35%" r="75%">
          <stop offset="0" stopColor="#ff8a7a" />
          <stop offset="1" stopColor="#c8392b" />
        </radialGradient>
        <filter id="bf-glow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* soft aura */}
      <ellipse className="bf-aura" cx="180" cy="350" rx="150" ry="320" />

      {/* ---- translucent body (athletic male silhouette) ---- */}
      <g className="bf-body">
        {/* head + neck + torso */}
        <path d="M180 24c-22 0-33 20-33 41 0 17 9 32 21 38l-2 17c-15 4-37 11-52 30-7 9-5 19-2 27 7 22 12 47 16 78 3 22 6 40 18 50h64c12-10 15-28 18-50 4-31 9-56 16-78 3-8 5-18-2-27-15-19-37-26-52-30l-2-17c12-6 21-21 21-38 0-21-11-41-33-41z" />
        {/* arms */}
        <path d="M120 154c-15 7-22 19-25 35l-12 92c-2 13 12 17 17 5l24-94z" />
        <path d="M240 154c15 7 22 19 25 35l12 92c2 13-12 17-17 5l-24-94z" />
        {/* legs */}
        <path d="M150 348c-4 12-6 30-6 52 0 78 3 158 9 236 2 16 21 16 23 0 5-66 7-150 6-216 0-30-1-50-3-60z" />
        <path d="M210 348c4 12 6 30 6 52 0 78-3 158-9 236-2 16-21 16-23 0-5-66-7-150-6-216 0-30 1-50 3-60z" />
      </g>

      {/* subtle muscle striations */}
      <path className="bf-stria" d="M165 160c8 4 22 4 30 0M160 186c12 5 28 5 40 0M158 214c14 6 30 6 44 0" />

      {/* scan sweep (showcase) */}
      {scan && <rect className="bf-scan" x="40" y="0" width="280" height="60" rx="30" />}

      {/* ---- organs ---- */}
      {order.map((id) => {
        const o = byId[id]
        if (!o) return null
        const def = SHAPES[id]
        const isSel = selected === id
        return (
          <g
            key={id}
            transform={`translate(${(T[id] || [0, 0]).join(' ')})`}
            className={`organ organ--${o.state} ${isSel ? 'is-selected' : ''}`}
            onClick={interactive ? () => onSelect && onSelect(id) : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={interactive ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect && onSelect(id) } } : undefined}
            role={interactive ? 'button' : undefined}
            aria-label={interactive ? `${o.label}: ${o.headline}` : undefined}
          >
            <g className="organ-glow" fill={STATE_FILL[o.state]} filter="url(#bf-glow)">{def.shape}</g>
            <g className="organ-shape" fill={STATE_FILL[o.state]}>{def.shape}</g>
            {def.detail}
            {/* pin / pulse marker */}
            <circle className="organ-pin" cx={def.pin[0]} cy={def.pin[1]} r="7" />
            {o.state !== 'healthy' && <circle className="organ-pulse" cx={def.pin[0]} cy={def.pin[1]} r="7" />}
            {isSel && <circle className="organ-sel-ring" cx={def.pin[0]} cy={def.pin[1]} r="13" />}
          </g>
        )
      })}
    </svg>
  )
}
