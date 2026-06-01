// Derived variables shared by gating logic and scoring engines.
// `a` is the answers map keyed by question id (e.g. a.B1, a.O47).

export function num(v) {
  if (v === undefined || v === null || v === '') return null
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export function derive(a) {
  const age = num(a.B1)
  const height = num(a.B3)
  const weight = num(a.B4)
  const bmi = height && weight ? weight / Math.pow(height / 100, 2) : null

  const sex = a.B2 // male | female | other
  const smokerCurrent = a.B7 === 'sometimes' || a.B7 === 'daily'
  const smokerDaily = a.B7 === 'daily'
  const everSmoked = a.B7 && a.B7 !== 'never'

  const diabetes = a.B13 === 'yes'
  const hasCVD = a.B14 === 'yes'
  const bpHigh = a.B5 === 'elevated' || a.B5 === 'high'

  const lowActivity = a.B9 === 'lt30' || a.B9 === '30-149'

  return {
    age, height, weight, bmi, sex,
    smokerCurrent, smokerDaily, everSmoked,
    diabetes, hasCVD, bpHigh, lowActivity,
  }
}
