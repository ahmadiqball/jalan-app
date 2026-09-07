// Formatting helpers — ported from the prototype. Locale is hardcoded id-ID.

export const DOW = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
export const DOW_LONG = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu',
]
export const MON = [
  'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des',
]
export const MON_LONG = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
]

/* ---- money ---- */

/** "Rp 1.234.000" */
export function rp(n: number): string {
  return 'Rp ' + Math.round(n).toLocaleString('id-ID')
}

/** digits of a string as a number: "Rp 10.000" -> 10000 */
export function digitsOnly(s: string): number {
  return parseInt(String(s).replace(/\D/g, '') || '0', 10)
}

/** group a raw number/string with id-ID thousand separators: "10000" -> "10.000" */
export function groupDigits(s: string | number): string {
  const digits = String(s).replace(/\D/g, '').replace(/^0+(?=\d)/, '')
  return digits ? Number(digits).toLocaleString('id-ID') : ''
}

/** compact money: "2,7jt" / "743rb" / "0" */
export function shortRp(n: number): string {
  if (!n) return '0'
  if (n >= 1_000_000) {
    const v = (n / 1_000_000).toFixed(2).replace(/0$/, '').replace(/\.$/, '')
    return v.replace('.', ',') + 'jt'
  }
  return Math.round(n / 1000) + 'rb'
}

/* ---- dates ---- */

export function addDays(iso: string, n: number): Date {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return d
}

export function isoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return d.getFullYear() + '-' + m + '-' + day
}

export function shortDate(d: Date): string {
  return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()]
}

export function longDate(d: Date): string {
  return DOW_LONG[d.getDay()] + ', ' + d.getDate() + ' ' + MON_LONG[d.getMonth()]
}

/** "12–15 Sep" or "28 Sep – 2 Okt" */
export function rangeLabel(iso: string, len: number): string {
  if (!iso) return 'belum diatur'
  const a = addDays(iso, 0)
  const b = addDays(iso, len - 1)
  return a.getMonth() === b.getMonth()
    ? a.getDate() + '–' + b.getDate() + ' ' + MON[b.getMonth()]
    : a.getDate() + ' ' + MON[a.getMonth()] + ' – ' + b.getDate() + ' ' + MON[b.getMonth()]
}

/* ---- times & durations ---- */

/** "13.40" -> minutes since midnight */
export function toMin(t: string): number | null {
  if (!t) return null
  const p = t.replace('.', ':').split(':')
  return parseInt(p[0]!, 10) * 60 + parseInt(p[1] || '0', 10)
}

/** minutes -> "13.40" */
export function fromMin(m: number): string {
  const v = ((m % 1440) + 1440) % 1440
  return String(Math.floor(v / 60)).padStart(2, '0') + '.' + String(v % 60).padStart(2, '0')
}

/** "13.40" -> "13:40" for <input type=time> */
export function toInput(t: string): string {
  return t ? t.replace('.', ':') : ''
}

export const DUR_STEPS = [0, 30, 45, 60, 90, 120, 150, 180, 210, 240, 300, 360, 480]

export function nearestDur(m: number): number {
  return DUR_STEPS.includes(m)
    ? m
    : DUR_STEPS.reduce((a, b) => (Math.abs(b - m) < Math.abs(a - m) ? b : a), 0)
}

/** "3 jam 15 menit" / "45 menit" / "Tanpa durasi" */
export function durLabel(m: number): string {
  if (!m) return 'Tanpa durasi'
  if (m < 60) return m + ' menit'
  const h = Math.floor(m / 60)
  const r = m % 60
  return h + ' jam' + (r ? ' ' + r + ' menit' : '')
}

/** "13.40–14.40" from time + duration */
export function timeRange(t: string, d: number): string {
  if (!t) return 'belum ada jam'
  const s = toMin(t)!
  return d ? t + '–' + fromMin(s + d) : t
}

/** Fisher–Yates shuffle (returns a new array). */
export function shuffle<T>(arr: T[]): T[] {
  const a = arr.slice()
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
}
