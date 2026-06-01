// ============================================================
// bodyMap.js — maps the test results onto per-organ states AND a
// proportional severity grade (0 healthy → 3 severe) derived from
// the real instrument scores (pack-years, AUDIT, SCORE2, FINDRISC…).
//
// buildBodyMap(passportData, answers) -> { organs:[...], worst }
// Each organ: { id, label, sub, state, severity, score, headline, findings:[], recs:[] }
//   state: 'healthy' | 'watch' | 'risk'   severity: 0 | 1 | 2 | 3
// ============================================================
import { computeResults } from './scoring.js'

const STATE = ['healthy', 'watch', 'risk', 'risk'] // by severity 0..3
const SCORE_BY_SEV = { 0: 90, 1: 68, 2: 47, 3: 30 }

const HEALTHY_TIP = {
  brain: 'Нервная система в хорошей форме. Поддерживайте сон 7–9 часов, движение и время без экранов.',
  heart: 'Сердце и сосуды без выраженных факторов риска. Сохраняйте активность, питание и контроль давления.',
  lungs: 'Дыхательная система чистая. Главное — оставаться некурящим и избегать табачного дыма.',
  liver: 'Печень не перегружена. Умеренность с алкоголем и сбалансированное питание сохранят её здоровье.',
  digestive: 'Обмен веществ и пищеварение в норме. Овощи, клетчатка и регулярные приёмы пищи — лучшая профилактика.',
  kidneys: 'Почки работают без видимой нагрузки. Контроль давления, сахара и достаточная вода берегут их.',
  muscles: 'Мышцы и опорно-двигательная система в тонусе. Силовые и кардио-нагрузки сохранят их с возрастом.',
}

const ORGANS = [
  { id: 'brain', label: 'Мозг и нервная система', sub: 'Сон · стресс · вещества', moduleKeys: ['dast', 'stopbang'], sev: sevBrain },
  { id: 'heart', label: 'Сердце и сосуды', sub: 'Давление · риск инфаркта', moduleKeys: ['score2', 'stopbang'], sev: sevHeart },
  { id: 'lungs', label: 'Лёгкие', sub: 'Дыхание · табак', moduleKeys: ['nicotine'], sev: sevLungs },
  { id: 'liver', label: 'Печень', sub: 'Алкоголь · детоксикация', moduleKeys: ['audit'], sev: sevLiver },
  { id: 'digestive', label: 'Пищеварение и обмен', sub: 'Сахар · питание · вес', moduleKeys: ['findrisc', 'metabolic'], sev: sevDigestive },
  { id: 'kidneys', label: 'Почки', sub: 'Давление · фильтрация', moduleKeys: ['metabolic'], sev: sevKidneys },
  { id: 'muscles', label: 'Мышцы и опора', sub: 'Активность · равновесие', moduleKeys: ['steadi'], sev: sevMuscles },
]

const SEV_FINDING = {
  brain: { 1: 'Лёгкая нагрузка на нервную систему', 2: 'Заметная нагрузка: сон / стресс / вещества', 3: 'Высокая нагрузка на нервную систему' },
  heart: { 1: 'Лёгкая нагрузка на сердце и сосуды', 2: 'Повышенный сердечно-сосудистый риск', 3: 'Высокий сердечно-сосудистый риск' },
  lungs: { 1: 'Лёгкое влияние табака на лёгкие', 2: 'Заметное влияние курения на лёгкие', 3: 'Выраженное влияние длительного курения' },
  liver: { 1: 'Лёгкая нагрузка на печень', 2: 'Заметная алкогольная нагрузка на печень', 3: 'Высокая алкогольная нагрузка на печень' },
  digestive: { 1: 'Лёгкая метаболическая нагрузка', 2: 'Заметная метаболическая нагрузка', 3: 'Высокая метаболическая нагрузка' },
  kidneys: { 1: 'Лёгкая нагрузка на почки', 2: 'Заметная нагрузка на почки', 3: 'Высокая нагрузка на почки' },
  muscles: { 1: 'Активности меньше нормы', 2: 'Низкая физическая активность', 3: 'Очень низкая активность / риск падений' },
}

export function buildBodyMap(data, answers) {
  const a = (id) => (answers ? answers[id] : undefined)
  const { derived: d, raw } = computeResults(answers || {})
  const byKey = {}
  ;(data?.modules || []).forEach((m) => { byKey[m.key] = m })

  const organs = ORGANS.map((def) => {
    const severity = Math.max(0, Math.min(3, def.sev(raw, d, a) | 0))
    const state = STATE[severity]
    // continuous 0–100 vitality (100 = luminous/healthy, 0 = most strained)
    const vitality = Math.max(0, Math.min(100, Math.round(100 - (STRAIN[def.id] ? STRAIN[def.id](raw, d, a) : 0))))
    const findings = []
    const recs = []

    // pull recs (and a generic finding) from the contributing modules
    def.moduleKeys.forEach((k) => {
      const m = byKey[k]
      if (!m || severity < 1) return
      ;(m.recs || []).slice(0, 2).forEach((r) => recs.push(r))
    })

    if (severity >= 1 && SEV_FINDING[def.id]?.[severity]) findings.push(SEV_FINDING[def.id][severity])

    let headline, recsOut
    if (severity === 0) {
      headline = 'В хорошей форме'
      recsOut = [HEALTHY_TIP[def.id]]
    } else {
      headline = severity >= 2 ? 'Требует внимания' : 'Стоит понаблюдать'
      recsOut = dedupe(recs).slice(0, 3)
      if (!recsOut.length) recsOut = [HEALTHY_TIP[def.id]]
    }

    return {
      id: def.id, label: def.label, sub: def.sub,
      state, severity, vitality, score: vitality,
      headline, findings: dedupe(findings).slice(0, 3), recs: recsOut,
    }
  })

  const worst = organs.reduce((w, o) => (o.severity > w.severity ? o : w), organs[0])
  const demographics = { sex: d.sex, age: d.age, bmi: d.bmi, heightCm: d.height, weightKg: d.weight }
  return { organs, worst: worst?.id || 'heart', demographics }
}

// ---------- per-organ severity (0..3) from real scores ----------
function sevLungs(raw, d, a) {
  let s = 0
  if (raw.packYears) { const py = raw.packYears.py; s = py >= 20 ? 3 : py >= 8 ? 2 : py > 0 ? 1 : 0 }
  if (raw.ftnd) s = Math.max(s, raw.ftnd.level === 'high' ? 3 : raw.ftnd.level === 'mod' ? 2 : 1)
  if (d.smokerCurrent && s === 0) s = 1
  if (a('B7') === 'quit' && s > 0) s = Math.max(1, s - 1) // recovering
  return s
}
function sevLiver(raw, d) {
  if (!raw.audit) return 0
  const { auditC, total } = raw.audit
  const positive = d.sex === 'female' ? auditC >= 3 : auditC >= 4
  if (!positive) return auditC >= 2 ? 1 : 0
  return total > 15 ? 3 : 2
}
function sevHeart(raw, d, a) {
  let s = 0
  if (raw.score2 && !raw.score2.insufficient) { const p = raw.score2.pct; s = p >= 10 ? 3 : p >= 5 ? 2 : p >= 2.5 ? 1 : 0 }
  if (a('B5') === 'high') s = Math.max(s, 2); else if (a('B5') === 'elevated') s = Math.max(s, 1)
  if (raw.stopBang && raw.stopBang.level === 'high') s = Math.max(s, 2)
  if (raw.metabolic && raw.metabolic.level === 'high') s = Math.max(s, 1)
  return s
}
function sevDigestive(raw, d, a) {
  let s = 0
  if (raw.findrisc) { const l = raw.findrisc.level; s = Math.max(s, l === 'high' ? 3 : l === 'mod' ? 2 : raw.findrisc.score >= 7 ? 1 : 0) }
  if (raw.metabolic) { const c = raw.metabolic.count; s = Math.max(s, c >= 3 ? 3 : c === 2 ? 2 : c === 1 ? 1 : 0) }
  if (a('B10') === 'sweets_fat' || a('B10') === 'irregular') s = Math.max(s, 1)
  return s
}
function sevBrain(raw, d, a) {
  let s = 0
  if (raw.dast) s = Math.max(s, raw.dast.level === 'high' ? 3 : raw.dast.level === 'mod' ? 2 : raw.dast.score > 0 ? 1 : 0)
  if (raw.stopBang) s = Math.max(s, raw.stopBang.level === 'high' ? 2 : raw.stopBang.level === 'mod' ? 1 : 0)
  if (a('B11') === 'lt6') s = Math.max(s, 1)
  if (a('B12') === 'often') s = Math.max(s, 1)
  return s
}
function sevKidneys(raw, d, a) {
  let s = 0
  if (a('B5') === 'high') s = Math.max(s, 2); else if (a('B5') === 'elevated') s = Math.max(s, 1)
  if (raw.metabolic && raw.metabolic.level === 'high') s = Math.max(s, 2)
  else if (raw.metabolic && raw.metabolic.count >= 1) s = Math.max(s, 1)
  return s
}
function sevMuscles(raw, d, a) {
  let s = 0
  if (a('B9') === 'lt30') s = 2; else if (a('B9') === '30-149') s = 1
  if (raw.steadi) s = Math.max(s, raw.steadi.level === 'high' ? 3 : raw.steadi.level === 'mod' ? 2 : 0)
  return s
}

// ---------- continuous strain (0..100) per organ, from raw magnitudes ----------
const clamp = (v) => Math.max(0, Math.min(100, v))
const STRAIN = {
  lungs(raw, d, a) {
    let s = 0
    if (raw.packYears) s = clamp(raw.packYears.py * 4)        // 25 pack-years -> 100
    if (raw.ftnd) s = Math.max(s, raw.ftnd.score * 10)         // FTND 0..10
    if (d.smokerCurrent && s < 25) s = 25
    if (a('B7') === 'quit') s *= 0.5
    return clamp(s)
  },
  liver(raw, d) {
    if (!raw.audit) return 0
    const { auditC, total } = raw.audit
    const pos = d.sex === 'female' ? auditC >= 3 : auditC >= 4
    return pos ? clamp(35 + (total - 8) * 4) : clamp(auditC * 7)
  },
  heart(raw, d, a) {
    let s = 0
    if (raw.score2 && !raw.score2.insufficient) s = clamp(raw.score2.pct * 7) // ~14% -> 100
    if (a('B5') === 'high') s = Math.max(s, 55); else if (a('B5') === 'elevated') s = Math.max(s, 30)
    if (raw.stopBang && raw.stopBang.level === 'high') s = Math.max(s, 45)
    if (raw.metabolic) s = Math.max(s, Math.min(40, raw.metabolic.count * 13))
    return clamp(s)
  },
  digestive(raw, d, a) {
    let s = 0
    if (raw.findrisc) s = Math.max(s, (raw.findrisc.score / 26) * 100)
    if (raw.metabolic) s = Math.max(s, Math.min(100, raw.metabolic.count * 22))
    if (a('B10') === 'sweets_fat' || a('B10') === 'irregular') s = Math.max(s, 30)
    return clamp(s)
  },
  brain(raw, d, a) {
    let s = 0
    if (raw.dast) s = Math.max(s, Math.min(100, raw.dast.score * 15))
    if (raw.stopBang) s = Math.max(s, raw.stopBang.score * 8)
    if (a('B11') === 'lt6') s = Math.max(s, 30)
    if (a('B12') === 'often') s = Math.max(s, 32); else if (a('B12') === 'sometimes') s = Math.max(s, 18)
    return clamp(s)
  },
  kidneys(raw, d, a) {
    let s = 0
    if (a('B5') === 'high') s = 55; else if (a('B5') === 'elevated') s = 30
    if (raw.metabolic) s = Math.max(s, Math.min(80, raw.metabolic.count * 18))
    return clamp(s)
  },
  muscles(raw, d, a) {
    let s = a('B9') === 'lt30' ? 65 : a('B9') === '30-149' ? 38 : 12
    if (raw.steadi && raw.steadi.level === 'high') s = Math.max(s, 75)
    else if (raw.steadi && raw.steadi.level === 'mod') s = Math.max(s, 50)
    return clamp(s)
  },
}

function dedupe(arr) {
  const seen = new Set()
  return arr.filter((x) => (seen.has(x) ? false : (seen.add(x), true)))
}
