// Puts the chosen Commons photos + credits onto the draft Lombok route (only that row).
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
const [dir, photosFile] = process.argv.slice(2)
const env = Object.fromEntries(readFileSync(join(dir, '.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]))
const P = JSON.parse(readFileSync(photosFile, 'utf8'))
const url = env.NUXT_SUPABASE_URL, key = env.NUXT_SUPABASE_SERVICE_KEY
const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
const ID = 'tpl-lombok-5'
const [row] = await fetch(`${url}/rest/v1/templates?id=eq.${ID}&select=data,published`, { headers: h }).then((r) => r.json())
if (!row) throw new Error('route not found')
if (row.published) throw new Error('route is live; refusing to edit it from a script')
const doc = row.data
doc.cover = P.cover.photo
doc.story = { ...doc.story, coverCredit: P.cover.credit, coverSource: P.cover.source }
const byTitle = {
  'Sunset di sisi barat Gili Air': 'sunset', 'Snorkeling keliling tiga Gili': 'snorkel', 'Air Terjun Sendang Gile dan Tiu Kelep': 'tiukelep',
  'Desa Sade': 'sade', 'Belajar surfing di Selong Belanak': 'selong', 'Pantai Tanjung Aan': 'aan', 'Sunset di Bukit Merese': 'merese',
}
let n = 0
for (const d of doc.days) for (const a of d.acts) {
  const k = byTitle[a.title]
  if (!k) continue
  Object.assign(a, { photo: P[k].photo, photoCredit: P[k].credit, photoSource: P[k].source }); n++
}
const res = await fetch(`${url}/rest/v1/templates?id=eq.${ID}`, { method: 'PATCH', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify({ data: doc, updated_at: new Date().toISOString() }) })
const out = await res.json()
console.log(res.status, `photos on ${n} stops + cover; published=${out[0]?.published}`)
