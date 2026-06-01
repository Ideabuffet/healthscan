// ============================================================
// anatomyPrompt.js — turns the user's per-organ states (from
// buildBodyMap) into ONE coherent, moderation-safe image prompt.
// Pure ESM: imported by both the React app and the Node server.
// ============================================================

export const BASE = `A premium, highly detailed 3D medical anatomy visualization of a single human anatomy teaching model (an educational glass-and-tissue model, not a real person), standing upright in a neutral symmetrical pose, front view, full body from head to feet fully in frame and centered, isolated on a plain transparent background. The model blends a realistic surface with a translucent X-ray view: the head has clear, refined facial features — eyes, eyebrows, ears, nose, mouth and short hair — and one shoulder and arm show a patch of realistic skin, while the rest of the body turns into translucent glass that reveals highly detailed internal organs in correct anatomical positions: brain, eyes, heart, two lungs, liver, stomach, pancreas, spleen, small and large intestines, kidneys and bladder, together with layered, detailed musculature and a faint skeleton. Cool cyan-and-blue palette with soft teal rim lighting and a subtle holographic medical-scan aesthetic. Hyper-detailed, elegant, premium and modern, tasteful and strictly non-graphic, clean and educational.`

// Per-organ damage descriptions, GRADED by severity (1 mild → 3 severe).
// Mild stays subtle and realistic; only severe looks pronounced.
const DAMAGE = {
  lungs: {
    1: 'the two lungs show mild, light-grey discoloration from a small amount of smoking (only slightly off from healthy pink)',
    2: 'the two lungs are moderately darkened and spotted from regular smoking, clearly affected but not fully black',
    3: 'the two lungs are heavily darkened and tar-stained from many years of heavy smoking',
  },
  liver: {
    1: 'the liver shows mild early changes from light alcohol use, only slightly dull',
    2: 'the liver looks moderately enlarged and fatty from alcohol strain',
    3: 'the liver is markedly enlarged, fatty and congested from heavy alcohol use',
  },
  heart: {
    1: 'the heart shows mild strain, gently highlighted',
    2: 'the heart looks moderately strained and slightly enlarged',
    3: 'the heart appears markedly enlarged and strained from high cardiovascular load',
  },
  brain: {
    1: 'the brain is subtly highlighted to indicate mild stress or poor sleep',
    2: 'the brain shows moderate tension shading',
    3: 'the brain is strongly highlighted to signal heavy strain from substances or severe sleep issues',
  },
  digestive: {
    1: 'the stomach and intestines look mildly irritated, a small hint of metabolic strain',
    2: 'the stomach and intestines look moderately inflamed from metabolic strain',
    3: 'the stomach and intestines look markedly inflamed and congested',
  },
  kidneys: {
    1: 'the kidneys look mildly dull',
    2: 'the kidneys look moderately strained and slightly discolored',
    3: 'the kidneys look markedly strained and discolored',
  },
  muscles: {
    1: 'the muscle tone looks slightly reduced from low activity',
    2: 'the muscles look moderately soft and underused',
    3: 'the muscles look markedly weak and atrophied from very low activity',
  },
}

const HEALTHY_TAIL = ' All organs are shown in natural, healthy coloring.'

const sevOf = (o) => (typeof o.severity === 'number' ? o.severity : o.state === 'risk' ? 3 : o.state === 'watch' ? 1 : 0)

// Builds a body-type clause from the user's real measurements so the figure
// matches THEM (sex, height, build from BMI).
function bodyClause(demo) {
  if (!demo) return ''
  const sexWord = demo.sex === 'female' ? 'an adult female physique' : demo.sex === 'male' ? 'an adult male physique' : 'an adult physique'
  let build = 'an average build'
  const b = demo.bmi
  if (b) build = b < 18.5 ? 'a slim, lean build' : b < 25 ? 'an average, fit build' : b < 30 ? 'a fuller, slightly heavier build with more abdominal volume' : 'a noticeably larger, heavier build with a rounder abdomen'
  const h = demo.heightCm ? `, roughly ${demo.heightCm} cm tall` : ''
  return ` The teaching model represents ${sexWord} with ${build}${h}, and its body proportions should reflect that.`
}

// organs: [{ id, state, severity }]  demo: { sex, bmi, heightCm }
export function buildAnatomyPrompt(organs, demo) {
  const body = bodyClause(demo)
  const affected = (organs || []).filter((o) => DAMAGE[o.id] && sevOf(o) >= 1)
  if (!affected.length) return BASE + body + HEALTHY_TAIL

  affected.sort((a, b) => sevOf(b) - sevOf(a)) // most severe first
  const clauses = affected.map((o) => DAMAGE[o.id][Math.min(3, Math.max(1, sevOf(o)))])

  const list =
    clauses.length === 1
      ? clauses[0]
      : clauses.slice(0, -1).join('; ') + '; and ' + clauses[clauses.length - 1]

  return (
    BASE + body +
    ` IMPORTANT — on this teaching model, render these specific conditions while keeping every other organ healthy: ${list}. ` +
    'Render each change PROPORTIONALLY to the degree described — keep mild changes subtle and close to healthy, reserve a strongly damaged look only for the severe cases; avoid cartoonish all-black extremes. Educational medical-illustration style, tasteful and non-graphic.'
  )
}

// A short, stable cache key (severity + body-type aware).
export function anatomyKey(organs, demo) {
  const d = demo ? `${demo.sex || '-'}/${demo.bmi ? Math.round(demo.bmi) : '-'}/${demo.heightCm || '-'}` : '-'
  const organKey = (organs || [])
    .map((o) => `${o.id}:${sevOf(o)}`)
    .filter((s) => !s.endsWith(':0'))
    .sort()
    .join('|') || 'all-healthy'
  return `${d}#${organKey}`
}
