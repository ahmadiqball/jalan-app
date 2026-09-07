import type { ContentDoc, TemplateTrip } from '../repositories/types'

interface DaySeed { title?: string; acts?: { time?: string; title: string; cat?: string; place?: string; cost?: number; dur?: number }[] }
interface TplSeed {
  id: string; name: string; place: string; mat: string; cover?: string; people?: number
  days: DaySeed[]; alloc?: Record<string, number>; packing?: { groups: string[]; items: { label: string; req?: boolean }[] }[]
}

/** Expand a concise seed into a full trip document (status: 'template'). */
function tpl(s: TplSeed): TemplateTrip {
  let seq = 0
  const days = s.days.map((d, i) => ({
    date: 'Hari ' + (i + 1),
    long: 'Hari ' + (i + 1),
    title: d.title || '',
    outfit: '',
    acts: (d.acts || []).map((a) => ({
      id: 'a' + s.id + ++seq,
      time: a.time || '',
      dur: a.dur ?? 60,
      title: a.title,
      cat: a.cat || 'Tempat',
      place: a.place || '',
      cost: a.cost ?? 0,
      note: '',
      paid: false,
    })),
  }))
  const alloc = s.alloc || {}
  const plan = Object.values(alloc).reduce((n, v) => n + v, 0)
  let pseq = 0
  const packing = (s.packing || []).map((g) => ({
    name: g.groups[0] || 'Lain-lain',
    items: g.items.map((it) => ({ id: 'p' + s.id + ++pseq, label: it.label, req: !!it.req, done: false })),
  }))
  return {
    id: s.id,
    name: s.name,
    place: s.place,
    mat: s.mat,
    cover: s.cover || '',
    dates: '',
    status: 'template',
    people: s.people ?? 2,
    plan,
    days,
    activeBudget: s.id + '-awal',
    budgets: [{ id: s.id + '-awal', name: 'Rencana awal', note: '', alloc }],
    outfitSets: [],
    manual: [],
    packing,
    members: [],
  }
}

/** Seed content shipped with the app; the admin can override it via /admin. */
export function defaultContent(): ContentDoc {
  return {
    templates: [
      tpl({
        id: 'tpl-sumba', name: 'Sumba 4 hari', place: 'Waingapu, Sumba Timur', mat: 'pantai', cover: '/img/photo-sumba.jpg',
        days: [
          { title: 'Tiba & sekitar kota', acts: [
            { time: '13.00', title: 'Tiba di Bandara Umbu Mehang Kunda', cat: 'Transport', cost: 0, dur: 60 },
            { time: '16.00', title: 'Bukit Wairinding', cat: 'Tiket & atraksi', place: 'Wairinding', cost: 50000, dur: 120 },
          ] },
          { title: 'Air terjun', acts: [
            { time: '08.00', title: 'Air Terjun Tanggedu', cat: 'Tiket & atraksi', place: 'Tanggedu', cost: 150000, dur: 300 },
          ] },
          { title: 'Pantai', acts: [
            { time: '09.00', title: 'Pantai Walakiri', cat: 'Tiket & atraksi', place: 'Pantai Walakiri', cost: 20000, dur: 180 },
          ] },
          { title: 'Pulang' },
        ],
        alloc: { 'Penginapan': 1200000, 'Transport': 900000, 'Makan & minum': 700000, 'Tiket & atraksi': 300000 },
        packing: [
          { groups: ['Dokumen'], items: [{ label: 'KTP', req: true }] },
          { groups: ['Pakaian'], items: [{ label: 'Baju pantai' }, { label: 'Sandal' }] },
          { groups: ['Perlengkapan'], items: [{ label: 'Sunblock SPF 50', req: true }, { label: 'Dry bag' }] },
        ],
      }),
      tpl({
        id: 'tpl-bromo', name: 'Bromo–Ijen 5 hari', place: 'Cemoro Lawang & Banyuwangi', mat: 'gunung', cover: '/img/photo-bromo.jpg',
        days: [
          { title: 'Menuju Bromo', acts: [{ time: '15.00', title: 'Perjalanan ke Cemoro Lawang', cat: 'Transport', cost: 0, dur: 240 }] },
          { title: 'Sunrise Bromo', acts: [
            { time: '03.30', title: 'Penanjakan sunrise', cat: 'Tiket & atraksi', place: 'Penanjakan Bromo', cost: 350000, dur: 300 },
          ] },
          { title: 'Ke Banyuwangi', acts: [{ time: '10.00', title: 'Perjalanan ke Banyuwangi', cat: 'Transport', cost: 0, dur: 300 }] },
          { title: 'Blue fire Ijen', acts: [
            { time: '01.00', title: 'Pendakian Kawah Ijen', cat: 'Tiket & atraksi', place: 'Kawah Ijen', cost: 100000, dur: 360 },
          ] },
          { title: 'Pulang' },
        ],
        alloc: { 'Penginapan': 1500000, 'Transport': 2000000, 'Makan & minum': 800000, 'Tiket & atraksi': 300000 },
        packing: [
          { groups: ['Pakaian'], items: [{ label: 'Jaket tebal anti angin', req: true }, { label: 'Sarung tangan' }] },
          { groups: ['Perlengkapan'], items: [{ label: 'Masker debu', req: true }, { label: 'Senter kepala' }] },
        ],
      }),
    ],
    recs: [
      { id: 'r-ktp', label: 'KTP dan kartu vaksin', groups: ['Dokumen'], req: true },
      { id: 'r-obat', label: 'Obat pribadi', groups: ['Dokumen'], req: true, url: 'https://www.halodoc.com/kategori/obat-obatan' },
      { id: 'r-pb', label: 'Powerbank 10.000 mAh', groups: ['Elektronik'], url: 'https://www.tokopedia.com/search?q=powerbank+10000mah' },
      { id: 'r-charger', label: 'Kabel dan kepala charger', groups: ['Elektronik'] },
      { id: 'r-sunblock', label: 'Sunblock SPF 50', groups: ['Perlengkapan'], url: 'https://www.tokopedia.com/search?q=sunblock+spf+50' },
      { id: 'r-botol', label: 'Botol minum lipat', groups: ['Perlengkapan'], url: 'https://www.tokopedia.com/search?q=botol+minum+lipat' },
      { id: 'r-sandal', label: 'Sandal gunung', groups: ['Pakaian'], url: 'https://www.tokopedia.com/search?q=sandal+gunung', mats: ['pantai'] },
      { id: 'r-drybag', label: 'Dry bag 10 liter', groups: ['Perlengkapan'], url: 'https://www.tokopedia.com/search?q=dry+bag+10+liter', mats: ['pantai'], cats: ['Tiket & atraksi'] },
      { id: 'r-renang', label: 'Baju renang', groups: ['Pakaian'], mats: ['pantai'] },
      { id: 'r-jaket', label: 'Jaket tebal anti angin', groups: ['Pakaian'], req: true, url: 'https://www.tokopedia.com/search?q=jaket+gunung', mats: ['gunung'] },
      { id: 'r-glove', label: 'Sarung tangan', groups: ['Pakaian'], mats: ['gunung'] },
      { id: 'r-masker', label: 'Masker debu', groups: ['Perlengkapan'], req: true, url: 'https://www.tokopedia.com/search?q=masker+debu', mats: ['gunung'] },
      { id: 'r-headlamp', label: 'Senter kepala', groups: ['Elektronik'], url: 'https://www.tokopedia.com/search?q=headlamp', mats: ['gunung'] },
      { id: 'r-jashujan', label: 'Jas hujan tipis', groups: ['Perlengkapan'], url: 'https://www.tokopedia.com/search?q=jas+hujan', mats: ['alam'] },
      { id: 'r-antislip', label: 'Sepatu anti selip', groups: ['Pakaian'], mats: ['alam'] },
      { id: 'r-antimaling', label: 'Tas selempang anti maling', groups: ['Perlengkapan'], url: 'https://www.tokopedia.com/search?q=tas+anti+maling', mats: ['kota'] },
      { id: 'r-topi', label: 'Topi', groups: ['Pakaian'], mats: ['kota'] },
    ],
  }
}
