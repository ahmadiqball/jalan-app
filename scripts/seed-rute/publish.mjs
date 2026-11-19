// Usage: node publish.mjs <project-dir> [--dry]
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES } from './data.mjs'

const [dir, flag] = process.argv.slice(2)
const here = dirname(fileURLToPath(import.meta.url))
const env = Object.fromEntries(readFileSync(join(dir, '.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]))
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const strip = (s) => (s || '').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim()

// ---- resolve photos from Commons (cached) ----
const cacheFile = join(here, 'photos-cache.json')
const cache = existsSync(cacheFile) ? JSON.parse(readFileSync(cacheFile, 'utf8')) : {}
const names = new Set()
for (const r of ROUTES) { names.add(r.cover); for (const d of r.days) for (const a of d.acts) if (a.photo) names.add(a.photo) }
const todo = [...names].filter((n) => !cache[n])
for (let i = 0; i < todo.length; i += 10) {
  const batch = todo.slice(i, i + 10)
  const u = 'https://commons.wikimedia.org/w/api.php?' + new URLSearchParams({
    action: 'query', format: 'json', prop: 'imageinfo', iiprop: 'url|extmetadata', iiurlwidth: '1920', titles: batch.map((n) => 'File:' + n).join('|'),
  })
  let d
  for (const wait of [0, 8, 20, 45]) {
    await sleep(wait * 1000 + 1500)
    const res = await fetch(u, { headers: { 'User-Agent': 'RouteSampleFetcher/0.1 (one-off photo lookup)' } })
    if (res.ok) { d = await res.json(); break }
  }
  if (!d) throw new Error('commons unavailable')
  const norm = Object.fromEntries((d.query.normalized || []).map((x) => [x.to, x.from]))
  for (const pg of Object.values(d.query.pages)) {
    const orig = (norm[pg.title] || pg.title).replace(/^File:/, '')
    const ii = pg.imageinfo?.[0]
    if (!ii) continue
    const m = ii.extmetadata || {}
    const artist = strip(m.Artist?.value).slice(0, 60) || 'Wikimedia Commons'
    cache[orig] = { photo: ii.thumburl || ii.url, credit: `${artist}, ${strip(m.LicenseShortName?.value)}, via Wikimedia Commons`, source: ii.descriptionurl }
  }
}
writeFileSync(cacheFile, JSON.stringify(cache, null, 1))
const missing = [...names].filter((n) => !cache[n])
console.log('photos resolved:', names.size - missing.length, '/', names.size)
if (missing.length) { console.log('MISSING:', missing); process.exit(1) }

// ---- build docs ----
function build(r) {
  const ID = r.id
  let seq = 0, pseq = 0
  const days = r.days.map((d, i) => ({
    date: 'Hari ' + (i + 1), long: 'Hari ' + (i + 1), title: d.title, story: d.story, outfit: '',
    acts: d.acts.map((a) => {
      const { photo, ...rest } = a
      const o = { id: 'a' + ID + ++seq, dur: 60, note: '', paid: false, ...rest }
      if (photo) { const p = cache[photo]; Object.assign(o, { photo: p.photo, photoCredit: p.credit, photoSource: p.source }) }
      return o
    }),
  }))
  const c = cache[r.cover]
  return {
    id: ID, name: r.name, place: r.place, mat: r.mat, cover: c.photo, dates: '', status: 'template', people: 2,
    plan: Object.values(r.alloc).reduce((n, v) => n + v, 0), published: true,
    story: { slug: r.slug, intro: r.intro, reasons: r.reasons, goodFor: r.goodFor, bestTime: r.bestTime, ...(r.budgetNote ? { budgetNote: r.budgetNote } : {}), coverCredit: c.credit, coverSource: c.source },
    days, activeBudget: ID + '-awal', budgets: [{ id: ID + '-awal', name: 'Rencana awal', note: '', alloc: r.alloc }], outfitSets: [], manual: [],
    packing: r.packing.map(([name, items]) => ({ name, items: items.map(([label, req]) => ({ id: 'p' + ID + ++pseq, label, req: !!req, done: false })) })),
    members: [],
  }
}
const docs = ROUTES.map(build)
for (const d of docs) console.log(d.id, d.name, d.days.length + 'd', d.days.reduce((n, x) => n + x.acts.length, 0) + ' stops', d.days.reduce((n, x) => n + x.acts.filter((a) => a.photo).length, 0) + ' photos', 'Rp' + d.plan)
if (flag === '--dry') process.exit(0)

const url = env.NUXT_SUPABASE_URL, key = env.NUXT_SUPABASE_SERVICE_KEY
const h = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }
const rows = await fetch(`${url}/rest/v1/templates?select=id,sort`, { headers: h }).then((r) => r.json())
let sort = Math.max(0, ...rows.map((r) => r.sort)) + 1
for (const d of docs) {
  if (rows.some((r) => r.id === d.id)) {
    if (flag !== '--update') { console.log('EXISTS, skipped', d.id); continue }
    const res = await fetch(`${url}/rest/v1/templates?id=eq.${d.id}`, { method: 'PATCH', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify({ data: d, updated_at: new Date().toISOString() }) })
    const out = await res.json()
    console.log(res.status, 'updated', out[0]?.id, 'published=' + out[0]?.published)
    continue
  }
  const res = await fetch(`${url}/rest/v1/templates`, { method: 'POST', headers: { ...h, Prefer: 'return=representation' }, body: JSON.stringify({ id: d.id, data: d, published: true, sort: sort++ }) })
  const out = await res.json()
  console.log(res.status, Array.isArray(out) ? `inserted ${out[0].id} published=${out[0].published}` : JSON.stringify(out))
}
