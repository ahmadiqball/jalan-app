// Builds the sample "Lombok 5 hari" route (draft) and upserts it into the templates table.
// Usage: node route.mjs <project-dir> [--dry]
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const [dir, flag] = process.argv.slice(2)
const env = Object.fromEntries(
  readFileSync(join(dir, '.env'), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z_]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1).trim()]),
)

const ID = 'tpl-lombok-5'
let seq = 0
const act = (time, title, cat, place, cost, dur, x = {}) => ({
  id: 'a' + ID + ++seq, time, dur, title, cat, place, cost, note: '', paid: false, ...x,
})
const day = (i, title, story, acts) => ({ date: 'Hari ' + i, long: 'Hari ' + i, title, story, outfit: '', acts })

const days = [
  day(1, 'Langsung ke Gili Air',
    'Hari ini isinya perjalanan, jadi jangan pasang target lain. Dari bandara ke Pelabuhan Bangsal sekitar dua jam, lalu menyeberang ke Gili Air sekitar 20 menit. Kalau lancar, kamu sampai sebelum matahari terbenam.',
    [
      act('11.00', 'Tiba di Bandara Lombok', 'Transport', 'Bandara Internasional Lombok', 0, 60),
      act('12.00', 'Mobil ke Pelabuhan Bangsal', 'Transport', 'Pelabuhan Bangsal', 400000, 120, {
        tip: 'Banyak calo di area parkir Bangsal. Beli tiket kapal langsung di loket resmi.',
      }),
      act('14.30', 'Kapal umum ke Gili Air', 'Transport', 'Gili Air', 50000, 30, {
        what: 'Kapal kayu yang berangkat begitu penumpangnya penuh.',
      }),
      act('17.30', 'Sunset di sisi barat Gili Air', 'Santai', 'Gili Air', 0, 90, {
        what: 'Sisi barat pulau menghadap ke Selat Lombok. Kalau langit cerah, Gunung Agung di Bali kelihatan di kejauhan.',
        why: 'Gili Air lebih sepi dari Gili Trawangan, jadi sore di sini lebih tenang.',
      }),
    ]),
  day(2, 'Seharian di laut',
    'Di Gili tidak ada motor atau mobil. Hari ini kamu bergerak dengan perahu, sepeda, dan jalan kaki saja.',
    [
      act('09.00', 'Snorkeling keliling tiga Gili', 'Tiket & atraksi', 'Gili Air', 300000, 300, {
        what: 'Perahu bersama yang berhenti di beberapa titik di antara Gili Air, Gili Meno, dan Gili Trawangan.',
        why: 'Penyu cukup sering terlihat di perairan ini, dan banyak titiknya dangkal, jadi nyaman untuk yang baru belajar snorkeling.',
        tip: 'Bawa sunblock yang aman untuk karang dan kaus lengan panjang. Di atas perahu panasnya terik.',
      }),
      act('15.00', 'Sepeda keliling Gili Air', 'Santai', 'Gili Air', 100000, 120, {
        what: 'Jalan pasir yang mengitari pulau. Tanpa berhenti, satu putaran kurang dari satu jam.',
        tip: 'Sebagian jalannya berpasir tebal. Kalau sepedanya berat, turun dan tuntun saja.',
      }),
      act('19.00', 'Makan malam ikan bakar', 'Makan & minum', 'Gili Air', 250000, 90),
    ]),
  day(3, 'Air terjun di kaki Rinjani',
    'Hari paling panjang di jalan, sekitar lima jam kalau dijumlah. Pagi keluar dari Gili, siang di Senaru, sore turun ke selatan. Dua air terjun di tengahnya jadi jeda yang pas.',
    [
      act('08.00', 'Kapal kembali ke Bangsal', 'Transport', 'Pelabuhan Bangsal', 50000, 30),
      act('09.00', 'Mobil ke Senaru', 'Transport', 'Senaru', 0, 90),
      act('11.00', 'Air Terjun Sendang Gile dan Tiu Kelep', 'Tiket & atraksi', 'Air Terjun Tiu Kelep', 200000, 180, {
        what: 'Sendang Gile bisa dicapai lewat tangga dari pintu masuk. Tiu Kelep ada lebih jauh di atasnya, lewat jalan setapak dan menyeberang sungai kecil.',
        why: 'Cara melihat sisi Rinjani tanpa mendaki berhari-hari. Tiu Kelep lebih tinggi dan lebih deras, dan kolamnya bisa dipakai berenang.',
        tip: 'Pakai sandal gunung, bukan sandal jepit. Jalur ke Tiu Kelep licin dan ada bagian yang airnya setinggi lutut. Pemandu lokal bisa disewa di pintu masuk.',
      }),
      act('15.00', 'Mobil ke Kuta Mandalika', 'Transport', 'Kuta Mandalika', 900000, 210),
    ]),
  day(4, 'Pantai selatan',
    'Hari santai setelah kemarin. Semua tempat hari ini kurang dari satu jam dari Kuta, jadi urutannya bisa kamu tukar sesuai cuaca.',
    [
      act('09.00', 'Desa Sade', 'Tiket & atraksi', 'Desa Sade', 100000, 90, {
        what: 'Kampung suku Sasak dengan rumah beratap alang-alang. Lantainya secara tradisional dilapisi kotoran kerbau.',
        why: 'Kamu bisa melihat kain tenun dibuat langsung di beranda rumah, dan letaknya searah dari Kuta.',
        tip: 'Warga biasanya menemani berkeliling tanpa tarif tetap. Siapkan uang untuk tip, atau beli kain di sana.',
      }),
      act('11.00', 'Belajar surfing di Selong Belanak', 'Tiket & atraksi', 'Pantai Selong Belanak', 400000, 180, {
        what: 'Teluk lebar berpasir putih dengan ombak kecil yang pecah jauh dari bibir pantai.',
        why: 'Salah satu tempat paling cocok di Lombok untuk surfing pertama kali. Dasarnya pasir, jadi lebih aman kalau jatuh.',
        tip: 'Papan dan instruktur bisa disewa langsung di pantai.',
      }),
      act('15.00', 'Pantai Tanjung Aan', 'Santai', 'Pantai Tanjung Aan', 20000, 120, {
        what: 'Dua teluk berdampingan dengan pasir yang berbeda. Satu halus, satu lagi butirannya besar seperti merica.',
        why: 'Airnya tenang untuk berenang, beda dengan Selong Belanak yang berombak.',
      }),
      act('17.30', 'Sunset di Bukit Merese', 'Santai', 'Bukit Merese', 10000, 90, {
        what: 'Bukit berumput di ujung Tanjung Aan. Dari atas kelihatan teluk dan pantai di kedua sisinya.',
        why: 'Cukup jalan kaki beberapa menit dari Tanjung Aan, jadi tidak perlu pindah kendaraan.',
        tip: 'Naik setengah jam sebelum matahari terbenam. Pakai alas kaki yang tidak licin di rumput kering.',
      }),
    ]),
  day(5, 'Pulang',
    'Bandara sekitar 30 menit dari Kuta. Paginya masih cukup untuk sarapan pelan atau berenang sekali lagi.',
    [
      act('09.00', 'Sarapan dan beli oleh-oleh', 'Makan & minum', 'Kuta Mandalika', 200000, 120),
      act('11.30', 'Mobil ke Bandara Lombok', 'Transport', 'Bandara Internasional Lombok', 200000, 45),
    ]),
]

const alloc = { 'Penginapan': 2800000, 'Transport': 1700000, 'Makan & minum': 1500000, 'Tiket & atraksi': 1000000 }
let pseq = 0
const pack = (name, items) => ({ name, items: items.map(([label, req]) => ({ id: 'p' + ID + ++pseq, label, req: !!req, done: false })) })

const doc = {
  id: ID,
  name: 'Lombok 5 hari',
  place: 'Lombok, Nusa Tenggara Barat',
  mat: 'pantai',
  cover: '',
  dates: '',
  status: 'template',
  people: 2,
  plan: Object.values(alloc).reduce((n, v) => n + v, 0),
  published: false,
  story: {
    slug: 'lombok-5-hari',
    intro: 'Lima hari dari utara ke selatan Lombok. Dua malam pertama di Gili Air, pulau kecil yang bisa kamu kelilingi naik sepeda. Satu hari ke air terjun di kaki Rinjani, lalu dua malam di Kuta Mandalika untuk pantai-pantai selatan.',
    reasons: [
      'Dari bandara langsung ke Gili. Hari pertama cukup sekali jalan jauh, dan kamu sudah di pulau sebelum sore.',
      'Senaru ada di utara, dekat Bangsal. Karena itu air terjunnya dikunjungi saat turun dari Gili, jadi kamu tidak perlu bolak-balik dari selatan.',
      'Hari ketiga paling lama di jalan, sekitar lima jam. Hari keempat sengaja dibuat santai di pantai untuk menebusnya.',
      'Dua malam terakhir di Kuta, sekitar 30 menit dari bandara, jadi hari pulang tidak buru-buru.',
    ],
    goodFor: 'Pasangan, teman, pertama kali ke Lombok',
    bestTime: 'Mei-September',
  },
  days,
  activeBudget: ID + '-awal',
  budgets: [{ id: ID + '-awal', name: 'Rencana awal', note: '', alloc }],
  outfitSets: [],
  manual: [],
  packing: [
    pack('Dokumen', [['KTP', true]]),
    pack('Pakaian', [['Baju renang'], ['Sandal gunung', true], ['Kaus lengan panjang']]),
    pack('Perlengkapan', [['Sunblock yang aman untuk karang', true], ['Dry bag'], ['Uang tunai']]),
  ],
  members: [],
}

if (flag === '--dry') {
  console.log(JSON.stringify({ name: doc.name, days: days.length, acts: seq, total: doc.plan }))
  process.exit(0)
}

const url = env.NUXT_SUPABASE_URL, key = env.NUXT_SUPABASE_SERVICE_KEY
if (!url || !key) throw new Error('Supabase env missing')
const headers = { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' }

// refuse to overwrite a row that already exists under this id
const existing = await fetch(`${url}/rest/v1/templates?id=eq.${ID}&select=id`, { headers }).then((r) => r.json())
if (existing.length) { console.log('EXISTS: not overwriting', ID); process.exit(1) }
const sorts = await fetch(`${url}/rest/v1/templates?select=sort`, { headers }).then((r) => r.json())
const sort = Math.max(0, ...sorts.map((r) => r.sort)) + 1

const res = await fetch(`${url}/rest/v1/templates`, {
  method: 'POST',
  headers: { ...headers, Prefer: 'return=representation' },
  body: JSON.stringify({ id: ID, data: doc, published: false, sort }),
})
const out = await res.json()
console.log(res.status, Array.isArray(out) ? `inserted ${out[0].id} published=${out[0].published} sort=${out[0].sort}` : JSON.stringify(out))
