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

const JOBS = [
  { name: 'base-healthy', prompt: BASE + ' All organs shown in natural, healthy coloring.' },
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
