// ============================================================
// HealthScan backend — holds OPENAI_API_KEY, generates the
// personalized anatomy image, serves the built SPA in prod.
//   POST /api/anatomy  { organs:[{id,state}] } -> { image, cached }
//   GET  /api/health   -> { ok, hasKey }
// ============================================================
import express from 'express'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildAnatomyPrompt, anatomyKey } from '../src/engine/anatomyPrompt.js'

console.log('[healthscan] booting…', { node: process.version, cwd: process.cwd() })
process.on('uncaughtException', (e) => console.error('[healthscan] uncaughtException', e))
process.on('unhandledRejection', (e) => console.error('[healthscan] unhandledRejection', e))

// optional server-only fallback config (key not set via env)
let CFG = {}
try { CFG = await import('./runtime-config.mjs') } catch { /* no fallback file */ }

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 3000
const KEY = process.env.OPENAI_API_KEY || CFG.OPENAI_API_KEY
const MODEL = process.env.ANATOMY_MODEL || 'gpt-image-1'
const QUALITY = process.env.ANATOMY_QUALITY || 'high'

const app = express()
app.set('trust proxy', 1)
app.use(express.json({ limit: '64kb' }))

// CORS — allow the configured site origin (and any *.dana-assist.com) to call the API
app.use((req, res, next) => {
  const o = req.get('origin') || ''
  const ok = o && (!process.env.ALLOWED_ORIGIN || o.startsWith(process.env.ALLOWED_ORIGIN) || /\.dana-assist\.com$/.test(new URL(o).hostname))
  if (ok) {
    res.set('Access-Control-Allow-Origin', o)
    res.set('Vary', 'Origin')
    res.set('Access-Control-Allow-Headers', 'Content-Type')
    res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  }
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

// simple in-memory cache: key -> data URL (resets on restart)
const cache = new Map()
const MAX_CACHE = 200

// ---- abuse / cost guards ----
const RATE_MAX = Number(process.env.ANATOMY_RATE_MAX || 6)       // per IP
const RATE_WINDOW = Number(process.env.ANATOMY_RATE_WINDOW || 600) * 1000 // 10 min
const MAX_INFLIGHT = Number(process.env.ANATOMY_MAX_INFLIGHT || 3)
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || CFG.ALLOWED_ORIGIN || '' // e.g. https://test.dana-assist.com
const hits = new Map() // ip -> [timestamps]
let inflight = 0

function rateLimited(ip) {
  const now = Date.now()
  const arr = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW)
  if (arr.length >= RATE_MAX) { hits.set(ip, arr); return true }
  arr.push(now); hits.set(ip, arr)
  if (hits.size > 5000) hits.clear()
  return false
}

app.get('/api/health', (_req, res) => res.json({ ok: true, hasKey: !!KEY, model: MODEL }))

app.post('/api/anatomy', async (req, res) => {
  try {
    if (!KEY) return res.status(503).json({ error: 'server_not_configured' })
    if (ALLOWED_ORIGIN) {
      const o = req.get('origin') || req.get('referer') || ''
      if (o && !o.startsWith(ALLOWED_ORIGIN)) return res.status(403).json({ error: 'forbidden_origin' })
    }
    const organs = Array.isArray(req.body?.organs) ? req.body.organs : []
    const demo = req.body?.demographics || null
    const key = anatomyKey(organs, demo)

    if (cache.has(key)) return res.json({ image: cache.get(key), cached: true })

    const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown'
    if (rateLimited(ip)) return res.status(429).json({ error: 'rate_limited' })
    if (inflight >= MAX_INFLIGHT) return res.status(503).json({ error: 'busy' })

    inflight++
    try {
      const prompt = buildAnatomyPrompt(organs, demo)
      const r = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${KEY}` },
        body: JSON.stringify({ model: MODEL, prompt, size: '1024x1536', quality: QUALITY, background: 'transparent', n: 1 }),
      })
      if (!r.ok) {
        const txt = await r.text()
        console.error('openai error', r.status, txt.slice(0, 300))
        return res.status(502).json({ error: 'generation_failed', status: r.status })
      }
      const data = await r.json()
      const b64 = data?.data?.[0]?.b64_json
      if (!b64) return res.status(502).json({ error: 'no_image' })

      const url = `data:image/png;base64,${b64}`
      if (cache.size >= MAX_CACHE) cache.delete(cache.keys().next().value)
      cache.set(key, url)
      res.json({ image: url, cached: false })
    } finally {
      inflight--
    }
  } catch (e) {
    console.error('anatomy route error', e)
    res.status(500).json({ error: 'server_error' })
  }
})

// serve built SPA (prod)
const dist = path.resolve(__dirname, '..', 'dist')
app.use(express.static(dist))
app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

app.listen(PORT, '0.0.0.0', () => console.log(`[healthscan] listening on 0.0.0.0:${PORT} (key:${!!KEY}, model:${MODEL})`))
