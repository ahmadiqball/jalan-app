/**
 * Mobile visual QA — screenshots key routes at 390px and flags any horizontal
 * overflow (the usual mobile bug) with the offending elements.
 *
 * Prereqs: a running server + headless Chromium.
 *   pnpm build && node .output/server/index.mjs &   # or: pnpm dev
 *   pnpm dlx playwright install chromium            # one-time browser download
 *
 * Usage:  BASE_URL=http://localhost:3000 node scripts/qa-mobile.mjs [outDir]
 * Auth:   seeds a stub session in localStorage so in-app pages render.
 * Exit:   non-zero if any route overflows — usable as a CI/regression gate.
 */
import { chromium } from 'playwright-core'
import fs from 'fs'
import path from 'path'
import os from 'os'

const BASE = process.env.BASE_URL || 'http://localhost:3000'
const OUT = process.argv[2] || 'scratch/qa-shots'
const WIDTH = Number(process.env.WIDTH || 390)

function findChromium() {
  const base = path.join(os.homedir(), '.cache/ms-playwright')
  if (!fs.existsSync(base)) throw new Error('No Playwright browser. Run: pnpm dlx playwright install chromium')
  for (const d of fs.readdirSync(base)) {
    for (const c of ['chrome-headless-shell-linux64/chrome-headless-shell', 'chrome-linux64/chrome', 'chrome-mac/Chromium.app/Contents/MacOS/Chromium']) {
      const p = path.join(base, d, c)
      if (fs.existsSync(p)) return p
    }
  }
  throw new Error('No Chromium found under ~/.cache/ms-playwright')
}

const routes = [
  ['beranda', '/beranda'],
  ['overview', '/trip/t1/overview'],
  ['days', '/trip/t1/days'],
  ['budget', '/trip/t1/budget'],
  ['expenses', '/trip/t1/expenses'],
  ['packing', '/trip/t1/packing'],
  ['outfit', '/trip/t1/outfit'],
  ['members', '/trip/t1/members'],
  ['guides', '/guides'],
  ['guide-detail', '/guides/bali'],
  ['place-detail', '/guides/bali/pl-old-island'],
  ['tersimpan', '/tersimpan'],
]

const browser = await chromium.launch({ executablePath: findChromium(), headless: true, args: ['--no-sandbox'] })
const ctx = await browser.newContext({ viewport: { width: WIDTH, height: 844 }, deviceScaleFactor: 2 })
await ctx.addInitScript(() => {
  try { localStorage.setItem('session', JSON.stringify({ authed: true, email: 'dev@local.id', name: 'Dev QA' })) } catch {}
})
const page = await ctx.newPage()
fs.mkdirSync(OUT, { recursive: true })

let failures = 0
for (const [name, route] of routes) {
  try {
    await page.goto(BASE + route, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    console.log(`!! ${name}: ${e.message}`)
  }
  await page.waitForTimeout(700)
  const info = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth
    const over = []
    for (const el of document.querySelectorAll('body *')) {
      const r = el.getBoundingClientRect()
      if (r.width < 1) continue
      if (r.right > vw + 1 || r.left < -1) {
        let anc = el.parentElement, scrollable = false
        while (anc) { const o = getComputedStyle(anc).overflowX; if (o === 'auto' || o === 'scroll') { scrollable = true; break } anc = anc.parentElement }
        if (scrollable) continue
        over.push({ tag: el.tagName.toLowerCase(), cls: (el.className?.toString() || '').slice(0, 64), right: Math.round(r.right), w: Math.round(r.width) })
      }
    }
    return { vw, scrollW: document.documentElement.scrollWidth, over: over.slice(0, 8) }
  })
  const bad = info.scrollW > info.vw
  if (bad) failures++
  console.log(`${bad ? 'FAIL' : ' ok '} ${name.padEnd(13)} ${bad ? `overflow scrollW=${info.scrollW} vw=${info.vw}` : ''}`)
  if (bad) for (const o of info.over) console.log(`       <${o.tag}> right=${o.right} w=${o.w} "${o.cls}"`)
  await page.screenshot({ path: path.join(OUT, name + '.png'), fullPage: true })
}
await browser.close()
console.log(`\n${failures ? failures + ' route(s) OVERFLOW' : 'all routes clean'} — shots in ${OUT}`)
process.exit(failures ? 1 : 0)
