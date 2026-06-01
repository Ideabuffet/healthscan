import { derive, num } from './derive.js'

// ============================================================
// Small scoring helpers
// ============================================================

const AUDIT_FREQ = { never: 1, monthly: 1, '2-4mo': 2, '2-3wk': 3, '4wk': 4 }
const AUDIT_QTY = { '1-2': 0, '3-4': 1, '5-6': 2, '7-9': 3, '10+': 4 }
const AUDIT_BINGE = { never: 0, 'lt-monthly': 1, monthly: 2, weekly: 3, daily: 4 }
const AUDIT_5 = { never: 0, 'lt-monthly': 1, monthly: 2, weekly: 3, daily: 4 }
const AUDIT_YN3 = { no: 0, past: 2, year: 4 }

export function auditCScore(a) {
  if (!a.O29 || !a.O30 || !a.O31) return null
  return (AUDIT_FREQ[a.O29] ?? 0) + (AUDIT_QTY[a.O30] ?? 0) + (AUDIT_BINGE[a.O31] ?? 0)
}

function auditFull(a) {
  const c = auditCScore(a)
  if (c === null) return null
  let extra = 0
  let complete = true
  for (const id of ['O32', 'O33', 'O34', 'O35', 'O36']) {
    if (a[id] === undefined) { complete = false; continue }
    extra += AUDIT_5[a[id]] ?? 0
  }
  for (const id of ['O37', 'O38']) {
    if (a[id] === undefined) { complete = false; continue }
    extra += AUDIT_YN3[a[id]] ?? 0
  }
  return { auditC: c, total: c + extra, complete }
}

// ---- SCORE2 / SCORE2-OP (ESC, Low-risk region / Spain) ----
function score2(a, d) {
  if (!(d.age !== null && d.age >= 40 && !d.hasCVD && !d.diabetes)) return null
  const sbp = num(a.O67), tc = num(a.O69), hdl = num(a.O71)
  if (sbp === null || tc === null || hdl === null) {
    return { insufficient: true }
  }
  const age = d.age
  const smoker = d.smokerCurrent ? 1 : 0
  const diabetes = 0
  const male = d.sex !== 'female' // treat non-female as male coefficients
  let xx, base, scale1, scale2, risk

  if (age < 70) {
    if (male) {
      xx = 0.3742 * (age - 60) / 5 + 0.6012 * smoker + 0.2777 * (sbp - 120) / 20 +
        0.6457 * diabetes + 0.1458 * (tc - 6) - 0.2698 * (hdl - 1.3) / 0.5 -
        0.0755 * (age - 60) / 5 * smoker - 0.0255 * (age - 60) / 5 * (sbp - 120) / 20 -
        0.0281 * (age - 60) / 5 * (tc - 6) + 0.0426 * (age - 60) / 5 * (hdl - 1.3) / 0.5 -
        0.0983 * (age - 60) / 5 * diabetes
      base = 0.9605; scale1 = -0.5699; scale2 = 0.7476
    } else {
      xx = 0.4648 * (age - 60) / 5 + 0.7744 * smoker + 0.3131 * (sbp - 120) / 20 +
        0.8096 * diabetes + 0.1002 * (tc - 6) - 0.2606 * (hdl - 1.3) / 0.5 -
        0.1088 * (age - 60) / 5 * smoker - 0.0277 * (age - 60) / 5 * (sbp - 120) / 20 -
        0.0226 * (age - 60) / 5 * (tc - 6) + 0.0613 * (age - 60) / 5 * (hdl - 1.3) / 0.5 -
        0.1272 * (age - 60) / 5 * diabetes
      base = 0.9776; scale1 = -0.7380; scale2 = 0.7019
    }
    const p1 = 1 - Math.pow(base, Math.exp(xx))
    risk = 1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - p1))))
  } else {
    if (male) {
      xx = 0.0634 * (age - 73) + 0.4245 * diabetes + 0.3524 * smoker + 0.0094 * (sbp - 150) +
        0.0850 * (tc - 6) - 0.3564 * (hdl - 1.4) - 0.0174 * (age - 73) * diabetes -
        0.0247 * (age - 73) * smoker - 0.0005 * (age - 73) * (sbp - 150) +
        0.0073 * (age - 73) * (tc - 6) + 0.0091 * (age - 73) * (hdl - 1.4)
      base = 0.7576; scale1 = -0.34; scale2 = 1.19
      const p1 = 1 - Math.pow(base, Math.exp(xx - 0.0929))
      risk = 1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - p1))))
    } else {
      xx = 0.0789 * (age - 73) + 0.6010 * diabetes + 0.4921 * smoker + 0.0102 * (sbp - 150) +
        0.0605 * (tc - 6) - 0.3040 * (hdl - 1.4) - 0.0107 * (age - 73) * diabetes -
        0.0255 * (age - 73) * smoker - 0.0004 * (age - 73) * (sbp - 150) -
        0.0009 * (age - 73) * (tc - 6) + 0.0154 * (age - 73) * (hdl - 1.4)
      base = 0.8082; scale1 = -0.52; scale2 = 1.01
      const p1 = 1 - Math.pow(base, Math.exp(xx - 0.229))
      risk = 1 - Math.exp(-Math.exp(scale1 + scale2 * Math.log(-Math.log(1 - p1))))
    }
  }
  const pct = Math.round(risk * 1000) / 10
  // age-dependent thresholds
  let level
  if (age < 50) level = pct < 2.5 ? 'low' : pct < 7.5 ? 'mod' : 'high'
  else if (age < 70) level = pct < 5 ? 'low' : pct < 10 ? 'mod' : 'high'
  else level = pct < 7.5 ? 'low' : pct < 15 ? 'mod' : 'high'
  return { pct, level }
}

// ---- FINDRISC ----
function findrisc(a, d) {
  if (!((d.bmi !== null && d.bmi >= 25) || (d.age !== null && d.age >= 45))) return null
  if (d.age === null || d.bmi === null) return null
  let s = 0
  s += d.age < 45 ? 0 : d.age < 55 ? 2 : d.age < 65 ? 3 : 4
  s += d.bmi < 25 ? 0 : d.bmi <= 30 ? 1 : 3
  const waist = num(a.O47)
  if (waist !== null) {
    if (d.sex === 'female') s += waist < 80 ? 0 : waist <= 86 ? 3 : 4
    else s += waist < 94 ? 0 : waist <= 100 ? 3 : 4
  }
  s += a.B9 === '150+' ? 0 : 2
  if (a.O72 === 'no') s += 1
  if (a.O41 === 'yes') s += 2
  if (a.B13 === 'yes') s += 5
  if (a.O73 === 'second') s += 3
  else if (a.O73 === 'first') s += 5

  let level, label
  if (s <= 6) { level = 'low'; label = 'Низкий' }
  else if (s <= 11) { level = 'low'; label = 'Слегка повышен' }
  else if (s <= 14) { level = 'mod'; label = 'Умеренный' }
  else if (s <= 20) { level = 'high'; label = 'Высокий' }
  else { level = 'high'; label = 'Очень высокий' }
  return { score: s, level, label }
}

// ---- FTND ----
function ftnd(a, d) {
  if (a.B7 !== 'daily') return null
  let s = 0
  s += ({ le5: 3, '6-30': 2, '31-60': 1, gt60: 0 })[a.O24] ?? 0
  if (a.O25 === 'yes') s += 1
  if (a.O26 === 'first') s += 1
  s += ({ lt5: 0, '5-10': 0, '11-20': 1, gt20: 2 })[a.O19] ?? 0
  if (a.O27 === 'yes') s += 1
  if (a.O28 === 'yes') s += 1
  let level, label
  if (s <= 2) { level = 'low'; label = 'Очень низкая' }
  else if (s <= 4) { level = 'low'; label = 'Низкая' }
  else if (s === 5) { level = 'mod'; label = 'Умеренная' }
  else if (s <= 7) { level = 'high'; label = 'Высокая' }
  else { level = 'high'; label = 'Очень высокая' }
  return { score: s, level, label }
}

// ---- Pack-years ----
function packYears(a, d) {
  if (!d.everSmoked) return null
  const cigsMap = { lt5: 3, '5-10': 8, '11-20': 15, gt20: 25 }
  const yrsMap = { lt5: 3, '5-10': 8, '11-20': 15, gt20: 25 }
  const cigs = cigsMap[a.O19], yrs = yrsMap[a.O20]
  if (cigs === undefined || yrs === undefined) return null
  const py = Math.round((cigs / 20) * yrs * 10) / 10
  const cat = py < 10 ? 'низкая' : py <= 20 ? 'умеренная' : 'высокая'
  return { py, cat }
}

// ---- STOP-Bang ----
function stopBang(a, d) {
  const gate = a.B11 === 'lt6' || a.O55 === 'yes' || (d.bmi !== null && d.bmi >= 30) ||
    d.bpHigh || (d.age !== null && d.age >= 50)
  if (!gate) return null
  let s = 0
  if (a.O92 === 'yes') s++
  if (a.O93 === 'yes') s++
  if (a.O94 === 'yes') s++
  if (a.O95 === 'yes' || d.bpHigh) s++
  if (d.bmi !== null && d.bmi > 35) s++
  if (d.age !== null && d.age > 50) s++
  if (num(a.O96) !== null && num(a.O96) > 40) s++
  if (d.sex !== 'female') s++
  const level = s <= 2 ? 'low' : s <= 4 ? 'mod' : 'high'
  return { score: s, level }
}

// ---- STEADI (falls, 65+) ----
function steadi(a, d) {
  if (d.age === null || d.age < 65) return null
  const falls = a.O61
  const anyFlag = (falls && falls !== 'no') || a.O62 === 'yes' || a.O65 === 'yes'
  let level, label
  if (falls === '2+') { level = 'high'; label = 'Высокий' }
  else if (anyFlag) { level = 'mod'; label = 'Повышенный' }
  else { level = 'low'; label = 'Низкий' }
  return { level, label }
}

// ---- DAST-10 ----
function dast(a, d) {
  if (a.B16 !== 'prev' && a.B16 !== 'recent12') return null
  const full = a.B16 === 'recent12'
  const ids = full
    ? ['O74', 'O75', 'O76', 'O77', 'O78', 'O79', 'O80', 'O81', 'O82', 'O83']
    : ['O74', 'O75', 'O76', 'O77', 'O78']
  let s = 0, answered = 0
  for (const id of ids) {
    if (a[id] === undefined) continue
    answered++
    if (a[id] === 'yes') s++
  }
  if (answered === 0) return null
  const redFlags = ['O79', 'O80', 'O81', 'O82', 'O83'].some((id) => a[id] === 'yes')
  let level, label
  if (s === 0) { level = 'low'; label = 'Нет признаков' }
  else if (s <= 2) { level = 'low'; label = 'Низкий уровень' }
  else if (s <= 5) { level = 'mod'; label = 'Умеренный' }
  else if (s <= 8) { level = 'high'; label = 'Существенный' }
  else { level = 'high'; label = 'Тяжёлый' }
  return { score: s, max: full ? 10 : 5, full, redFlags, level, label }
}

// ---- Metabolic risk profile ----
function metabolic(a, d) {
  const factors = []
  const waist = num(a.O47)
  const waistHigh = waist !== null && (d.sex === 'female' ? waist > 86 : waist > 100)
  if ((d.bmi !== null && d.bmi >= 30) || waistHigh) factors.push('Абдоминальное ожирение')
  if (a.B9 === 'lt30' || a.B9 === '30-149') factors.push('Низкая активность')
  if (a.B10 === 'sweets_fat' || a.B10 === 'irregular') factors.push('Несбалансированное питание')
  if (d.bpHigh) factors.push('Повышенное давление')
  if (a.B6 === 'yes') factors.push('Повышенный холестерин')
  if (a.B13 === 'yes') factors.push('Повышенный сахар')
  const n = factors.length
  const level = n <= 1 ? 'low' : n <= 3 ? 'mod' : 'high'
  const label = n <= 1 ? 'Низкий' : n <= 3 ? 'Умеренный' : 'Высокий'
  return { factors, count: n, level, label }
}

// ---- Cancer red flags ----
function cancerFlags(a, d) {
  const gate = a.B17 === 'yes' || (d.age !== null && d.age >= 50) ||
    (d.age !== null && d.age >= 40 && (d.everSmoked || a.B8 === '14+'))
  if (!gate) return null
  const any =
    a.B17 === 'yes' ||
    (a.O84 && a.O84 !== 'no') ||
    ['O85', 'O86', 'O87', 'O88', 'O89', 'O90', 'O91'].some((id) => a[id] === 'yes')
  const severe = a.O88 === 'yes' || a.O90 === 'yes' ||
    a.O84 === '6-10' || a.O84 === '10+'
  return { any, severe, level: any ? 'high' : 'low' }
}

// ============================================================
// Biological age + health index
// ============================================================
function biologicalAge(a, d, modules) {
  const age = d.age ?? 40
  const factors = [] // {label, dir:'up'|'down', w}
  const add = (label, dir, w) => factors.push({ label, dir, w })

  if (a.B7 === 'daily') add('Ежедневное курение', 'up', 6)
  else if (a.B7 === 'sometimes') add('Курение', 'up', 3)
  else if (a.B7 === 'quit' && a.O23 === 'lt1y') add('Недавний отказ от курения', 'up', 1)
  else if (a.B7 === 'never') add('Никогда не курил(а)', 'down', 1.5)

  if (d.bmi !== null) {
    if (d.bmi >= 35) add('Выраженное ожирение', 'up', 5)
    else if (d.bmi >= 30) add('Ожирение', 'up', 3)
    else if (d.bmi >= 27) add('Избыточный вес', 'up', 1.5)
    else if (d.bmi < 18.5) add('Дефицит массы тела', 'up', 1)
    else if (d.bmi >= 18.5 && d.bmi < 25) add('Здоровый вес', 'down', 1.5)
  }

  if (a.B9 === '150+') add('Регулярная активность', 'down', 2)
  else if (a.B9 === 'lt30') add('Малоподвижный образ жизни', 'up', 2)

  if (a.B5 === 'high') add('Высокое давление', 'up', 3)
  else if (a.B5 === 'elevated') add('Повышенное давление', 'up', 1.5)

  if (a.B13 === 'yes') add('Повышенный сахар', 'up', 4)
  if (a.B6 === 'yes') add('Повышенный холестерин', 'up', 1.5)

  if (a.B8 === '14+') add('Высокое потребление алкоголя', 'up', 3)
  else if (a.B8 === '8-14') add('Повышенное потребление алкоголя', 'up', 1.5)

  if (a.B10 === 'sweets_fat') add('Избыток сладкого/жирного', 'up', 1.5)
  else if (a.B10 === 'irregular') add('Нерегулярное питание', 'up', 1)
  else if (a.B10 === 'balanced') add('Сбалансированное питание', 'down', 1)

  if (a.B11 === 'lt6') add('Недостаток сна', 'up', 1.5)
  if (a.B12 === 'often') add('Частый стресс', 'up', 1.5)
  if (a.O72 === 'yes') add('Овощи и фрукты ежедневно', 'down', 1)

  if (modules.score2?.level === 'high') add('Высокий ССriск', 'up', 3)
  else if (modules.score2?.level === 'mod') add('Умеренный ССriск', 'up', 1)
  if (modules.findrisc?.level === 'high') add('Высокий риск диабета', 'up', 2)

  let delta = factors.reduce((s, f) => s + (f.dir === 'up' ? f.w : -f.w), 0)
  delta = Math.max(-12, Math.min(20, delta))
  let bioAge = Math.round(age + delta)
  bioAge = Math.max(18, Math.max(age - 12, bioAge))
  const healthScore = Math.max(12, Math.min(99, Math.round(90 - delta * 2.4)))

  // most influential factors for display
  const top = [...factors].sort((x, y) => y.w - x.w)
  return { bioAge, realAge: age, delta: bioAge - age, factors: top, healthScore }
}

// ============================================================
// Public: compute everything
// ============================================================
export function computeResults(answers) {
  const d = derive(answers)
  const raw = {
    score2: score2(answers, d),
    findrisc: findrisc(answers, d),
    audit: auditFull(answers),
    ftnd: ftnd(answers, d),
    packYears: packYears(answers, d),
    stopBang: stopBang(answers, d),
    steadi: steadi(answers, d),
    dast: dast(answers, d),
    metabolic: metabolic(answers, d),
    cancer: cancerFlags(answers, d),
  }
  const bio = biologicalAge(answers, d, raw)
  return { derived: d, raw, bio }
}
