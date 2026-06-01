// Offline anatomy-image generator (OpenAI Images API · gpt-image-1).
// Reads key from env: OPENAI_API_KEY. Never hardcode the key here.
// Usage: OPENAI_API_KEY=sk-... node scripts/genAnatomy.mjs
import { writeFile, mkdir } from 'node:fs/promises'
import path from 'node:path'
import { BASE } from '../src/engine/anatomyPrompt.js'

const KEY = process.env.OPENAI_API_KEY
if (!KEY) { console.error('Missing OPENAI_API_KEY'); process.exit(1) }

const OUT = path.resolve('public/anatomy')
await mkdir(OUT, { recursive: true })

const LAYERED = `A highly detailed educational medical anatomy illustration of a full human figure (an anatomy teaching model), front view, standing upright, head to feet fully in frame and centered, isolated on a plain transparent background. LAYERED anatomy-chart style — the body transitions across visible layers: on one side a section of realistic textured skin, transitioning into the muscle layer with visible fibers and definition, transitioning into the internal organs (brain, eyes, heart, two lungs, liver, stomach, intestines, kidneys) and a faint skeleton beneath. Rendered realistically with natural surface texture and subtle, lifelike imperfections — NOT idealized, plastic or perfectly smooth. Soft even lighting on the figure only. The background MUST be fully transparent — no backdrop, no floor, no shadow on ground, no colored or gradient background, no scenery; a clean isolated cut-out of just the figure with alpha transparency. Anatomically accurate, premium, tasteful and strictly non-graphic, educational. Vertical full-body composition.`

const FEMALE = `A clean educational anatomy chart of a female anatomy teaching model — a stylized medical mannequin (not a real person, fully non-sexual, no nudity, no skin detail on the torso), front view, full figure standing, isolated. Layered medical-chart style showing the muscle layer and the internal organs (brain, heart, lungs, liver, stomach, intestines, kidneys) with a faint skeleton, on a plain neutral studio background. Flat clinical anatomy-poster illustration, premium, tasteful, strictly non-graphic and non-sexual, educational.`

const JOBS = [
  { name: 'base-female', prompt: FEMALE },
]

for (const job of JOBS) {
  process.stdout.write(`generating ${job.name} ... `)
  const t0 = Date.now()
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({
      model: 'gpt-image-1',
      prompt: job.prompt,
      size: '1024x1536',
      quality: 'high',
      background: 'transparent',
      n: 1,
    }),
  })
  if (!res.ok) {
    const txt = await res.text()
    console.error(`\nFAILED ${job.name} [${res.status}]: ${txt.slice(0, 400)}`)
    process.exit(2)
  }
  const data = await res.json()
  const b64 = data?.data?.[0]?.b64_json
  if (!b64) { console.error(`\nNo image data for ${job.name}`); process.exit(3) }
  const file = path.join(OUT, `${job.name}.png`)
  await writeFile(file, Buffer.from(b64, 'base64'))
  console.log(`ok (${((Date.now() - t0) / 1000).toFixed(1)}s) -> ${file}`)
}
console.log('done')
