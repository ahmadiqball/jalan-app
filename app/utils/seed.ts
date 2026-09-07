import type { Member, Trip } from '~/types/domain'

/** ISO start dates per seed trip (drives regenerated day labels / edit form). */
export const SEED_START: Record<string, string> = {
  t1: '2026-09-12',
  t2: '2026-09-26',
  t3: '2026-10-04',
  t4: '2026-11-21',
}

const SEED_MEMBERS: Record<string, Member[]> = {
  t1: [
    { id: 'u1', name: 'Rina Kartika', email: 'rina@kelana.id', role: 'Pemilik', status: 'aktif' },
    { id: 'u2', name: 'Dimas Prayoga', email: 'dimas@mail.com', role: 'Bisa ubah', status: 'aktif' },
    { id: 'u3', name: 'Ayu Larasati', email: 'ayu@mail.com', role: 'Hanya lihat', status: 'menunggu' },
  ],
  t2: [
    { id: 'u1', name: 'Rina Kartika', email: 'rina@kelana.id', role: 'Pemilik', status: 'aktif' },
    { id: 'u4', name: 'Sari Hapsari', email: 'sari@mail.com', role: 'Bisa ubah', status: 'aktif' },
  ],
}

export function seedMembers(id: string): Member[] {
  return (
    SEED_MEMBERS[id] || [
      { id: 'u1', name: 'Rina Kartika', email: 'rina@kelana.id', role: 'Pemilik', status: 'aktif' },
    ]
  ).map((m) => ({ ...m }))
}

/** Fresh copy of the seed trips (deep-cloned so the store owns its own data). */
export function seedTrips(): Trip[] {
  const trips: Trip[] = [
    {
      id: 't1',
      name: 'Sumba Timur',
      place: 'Air Terjun Tanggedu, Sumba Timur',
      mat: 'pantai',
      cover: '/img/photo-sumba.jpg',
      dates: '12–15 Sep',
      status: 'live',
      people: 3,
      plan: 3100000,
      startIso: SEED_START.t1,
      days: [
        {
          date: 'Sab, 12 Sep',
          long: 'Sabtu, 12 September',
          title: 'Tiba & Waingapu',
          outfit: 'Kaos katun, celana panjang tipis, sepatu ringan untuk jalan kota.',
          acts: [
            { id: 'a1', dur: 60, time: '13.40', title: 'Tiba di Bandara Umbu Mehang Kunda', cat: 'Transport', place: 'Waingapu, Sumba Timur', cost: 0, note: 'Sewa mobil sudah dibooking, jemput di pintu keluar.' },
            { id: 'a2', dur: 30, time: '16.00', title: 'Check-in penginapan Waingapu', cat: 'Penginapan', place: 'Waingapu, Sumba Timur', cost: 650000, note: 'Dibayar di muka lewat transfer.' },
            { id: 'a3', dur: 90, time: '19.00', title: 'Makan malam ikan bakar', cat: 'Makan & minum', place: 'Pasar Matawai, Waingapu', cost: 170000, note: '' },
          ],
        },
        {
          date: 'Min, 13 Sep',
          long: 'Minggu, 13 September',
          title: 'Bukit Wairinding',
          outfit: 'Kemeja linen lengan panjang untuk matahari, topi lebar, sandal.',
          acts: [
            { id: 'a4', dur: 120, time: '05.30', title: 'Sunrise di Bukit Wairinding', cat: 'Tiket & atraksi', place: 'Wairinding, Sumba Timur', cost: 150000, note: 'Bawa uang kecil untuk parkir dan anak-anak setempat.' },
            { id: 'a5', dur: 45, time: '09.00', title: 'Sarapan kopi Sumba', cat: 'Makan & minum', place: 'Waingapu', cost: 95000, note: '' },
            { id: 'a6', dur: 90, time: '15.00', title: 'Kampung adat Prailiu', cat: 'Tiket & atraksi', place: 'Prailiu, Waingapu', cost: 200000, note: 'Sopan: minta izin sebelum memfoto rumah adat.' },
            { id: 'a7', dur: 90, time: '19.30', title: 'Makan malam di penginapan', cat: 'Makan & minum', place: 'Waingapu', cost: 210000, note: '' },
          ],
        },
        {
          date: 'Sen, 14 Sep',
          long: 'Senin, 14 September',
          title: 'Tanggedu & Gili',
          outfit: 'Kaos linen putih, celana pendek cepat kering, sandal gunung. Bawa kaos ganti karena akan basah.',
          acts: [
            { id: 'a8', dur: 45, time: '07.30', title: 'Sarapan di Warung Ibu Nur', cat: 'Makan & minum', place: 'Waingapu, Sumba Timur', cost: 75000, note: '' },
            { id: 'a9', dur: 180, time: '10.00', title: 'Air Terjun Tanggedu', cat: 'Tiket & atraksi', place: 'Tanggedu, Sumba Timur', cost: 150000, note: 'Ojek 40 menit dari jalan utama, jalan kaki 15 menit terakhir.' },
            { id: 'a10', dur: 150, time: '15.00', title: 'Kapal ke Gili Trawangan', cat: 'Transport', place: 'Pelabuhan Waingapu', cost: 350000, note: 'Naik 30 menit sebelum jadwal, tiket dicek di dermaga.' },
            { id: 'a11', dur: 60, time: '19.30', title: 'Jalan sore di pantai Walakiri', cat: 'Santai', place: 'Walakiri, Sumba Timur', cost: 0, note: 'Pohon bakau paling bagus saat matahari turun.' },
          ],
        },
        {
          date: 'Sel, 15 Sep',
          long: 'Selasa, 15 September',
          title: 'Pulang',
          outfit: '',
          acts: [
            { id: 'a12', dur: 0, time: '11.20', title: 'Terbang Waingapu – Denpasar', cat: 'Transport', place: 'Bandara Umbu Mehang Kunda', cost: 0, note: 'Sudah dibayar di muka.' },
          ],
        },
      ],
      activeBudget: 't1-hemat',
      budgets: [
        { id: 't1-hemat', name: 'Hemat', note: 'Versi yang dipakai saat berangkat', alloc: { 'Makan & minum': 800000, 'Transport': 1100000, 'Tiket & atraksi': 400000, 'Penginapan': 650000, 'Lain': 150000 } },
        { id: 't1-nyaman', name: 'Nyaman', note: 'Kalau kapal privat diambil', alloc: { 'Makan & minum': 1000000, 'Transport': 1600000, 'Tiket & atraksi': 600000, 'Penginapan': 900000, 'Lain': 300000 } },
      ],
      outfitSets: [
        { id: 'o1', scope: 'day:0', top: 'Kaos katun', bottom: 'Celana panjang tipis', shoes: 'Sepatu ringan', other: '' },
        { id: 'o2', scope: 'day:1', top: 'Kemeja linen lengan panjang', bottom: 'Celana chino tipis', shoes: 'Sandal', other: 'Topi lebar' },
        { id: 'o3', scope: 'act:a9', top: 'Kaos linen putih', bottom: 'Celana pendek cepat kering', shoes: 'Sandal gunung', other: 'Kaos ganti, dry bag' },
      ],
      manual: [
        { id: 'm1', title: 'Kopi di pelabuhan', cat: 'Makan & minum', dayIdx: 2, amount: 24000, note: '' },
        { id: 'm2', title: 'Air mineral & snack', cat: 'Makan & minum', dayIdx: 2, amount: 38000, note: '' },
        { id: 'm3', title: 'Ojek pagi ke jalan utama', cat: 'Lain', dayIdx: 2, amount: 60000, note: '' },
        { id: 'm4', title: 'Oleh-oleh tenun kecil', cat: 'Lain', dayIdx: 1, amount: 185000, note: '' },
      ],
      packing: [
        { name: 'Dokumen', items: [
          { id: 'p1', label: 'KTP dan kartu vaksin', req: true, done: false },
          { id: 'p2', label: 'Obat pribadi', req: true, done: false, url: 'https://www.halodoc.com/kategori/obat-obatan' },
          { id: 'p3', label: 'Tiket kapal cetak', req: false, done: true },
        ] },
        { name: 'Pakaian', items: [
          { id: 'p4', label: 'Sandal gunung', req: false, done: false, url: 'https://www.tokopedia.com/search?q=sandal+gunung' },
          { id: 'p5', label: 'Jaket tipis anti angin', req: false, done: false, url: 'https://www.tokopedia.com/search?q=jaket+anti+angin' },
          { id: 'p6', label: 'Baju renang', req: false, done: true },
        ] },
        { name: 'Elektronik', items: [
          { id: 'p7', label: 'Powerbank 10.000 mAh', req: false, done: false },
          { id: 'p8', label: 'Kabel dan kepala charger', req: false, done: true },
        ] },
      ],
      members: [],
    },
    {
      id: 't2',
      name: 'Ubud & Tegallalang',
      place: 'Tegallalang, Gianyar',
      mat: 'alam',
      cover: '/img/photo-ubud.jpg',
      dates: '26–28 Sep',
      status: 'plan',
      people: 2,
      plan: 1850000,
      startIso: SEED_START.t2,
      days: [
        { date: 'Sab, 26 Sep', long: 'Sabtu, 26 September', title: 'Tiba & Ubud pusat', outfit: '', acts: [
          { id: 'b1', dur: 30, time: '12.00', title: 'Check-in guesthouse Ubud', cat: 'Penginapan', place: 'Ubud, Gianyar', cost: 520000, note: '' },
          { id: 'b2', dur: 90, time: '18.30', title: 'Makan malam di Jalan Suweta', cat: 'Makan & minum', place: 'Ubud', cost: 180000, note: '' },
        ] },
        { date: 'Min, 27 Sep', long: 'Minggu, 27 September', title: 'Terasering Tegallalang', outfit: '', acts: [
          { id: 'b3', dur: 120, time: '07.00', title: 'Jalan pagi di terasering', cat: 'Tiket & atraksi', place: 'Tegallalang, Gianyar', cost: 90000, note: '' },
          { id: 'b4', dur: 60, time: '13.00', title: 'Makan siang warung lokal', cat: 'Makan & minum', place: 'Tegallalang', cost: 120000, note: '' },
        ] },
        { date: 'Sen, 28 Sep', long: 'Senin, 28 September', title: 'Pulang', outfit: '', acts: [] },
      ],
      activeBudget: 't2-awal',
      budgets: [
        { id: 't2-awal', name: 'Rencana awal', note: '', alloc: { 'Makan & minum': 600000, 'Transport': 400000, 'Tiket & atraksi': 250000, 'Penginapan': 550000, 'Lain': 100000 } },
      ],
      outfitSets: [],
      manual: [],
      packing: [
        { name: 'Dokumen', items: [{ id: 'q1', label: 'KTP', req: true, done: false }] },
        { name: 'Pakaian', items: [
          { id: 'q2', label: 'Sarung untuk pura', req: false, done: false },
          { id: 'q3', label: 'Jas hujan tipis', req: false, done: false },
        ] },
      ],
      members: [],
    },
    {
      id: 't3',
      name: 'Bromo Sunrise',
      place: 'Cemoro Lawang, Probolinggo',
      mat: 'gunung',
      cover: '/img/photo-bromo.jpg',
      dates: '4–8 Okt',
      status: 'plan',
      people: 4,
      plan: 4600000,
      startIso: SEED_START.t3,
      days: [
        { date: 'Sab, 4 Okt', long: 'Sabtu, 4 Oktober', title: 'Perjalanan ke Cemoro Lawang', outfit: '', acts: [
          { id: 'c1', dur: 480, time: '20.00', title: 'Kereta malam Surabaya – Probolinggo', cat: 'Transport', place: 'Stasiun Gubeng', cost: 320000, note: '' },
        ] },
        { date: 'Min, 5 Okt', long: 'Minggu, 5 Oktober', title: 'Sunrise Penanjakan', outfit: '', acts: [
          { id: 'c2', dur: 240, time: '03.00', title: 'Jeep ke Penanjakan', cat: 'Transport', place: 'Cemoro Lawang', cost: 700000, note: '' },
          { id: 'c3', dur: 120, time: '09.00', title: 'Kawah Bromo', cat: 'Tiket & atraksi', place: 'Taman Nasional Bromo', cost: 440000, note: '' },
        ] },
      ],
      activeBudget: 't3-jeep',
      budgets: [
        { id: 't3-jeep', name: 'Jeep berbagi', note: 'Jeep dibagi 4 orang', alloc: { 'Makan & minum': 900000, 'Transport': 2000000, 'Tiket & atraksi': 900000, 'Penginapan': 700000, 'Lain': 100000 } },
        { id: 't3-privat', name: 'Jeep privat', note: 'Lebih lega, lebih mahal', alloc: { 'Makan & minum': 900000, 'Transport': 2900000, 'Tiket & atraksi': 900000, 'Penginapan': 1100000, 'Lain': 200000 } },
      ],
      outfitSets: [],
      manual: [],
      packing: [
        { name: 'Pakaian', items: [
          { id: 'r1', label: 'Jaket tebal', req: true, done: false },
          { id: 'r2', label: 'Sarung tangan', req: false, done: false },
          { id: 'r3', label: 'Masker debu', req: true, done: false },
        ] },
      ],
      members: [],
    },
    {
      id: 't4',
      name: 'Bali Selatan',
      place: 'Seminyak & Uluwatu, Badung',
      mat: 'kota',
      cover: '/img/photo-kota.jpg',
      dates: '21–24 Nov',
      status: 'draft',
      people: 2,
      plan: 2700000,
      startIso: SEED_START.t4,
      days: [
        { date: 'Sab, 21 Nov', long: 'Sabtu, 21 November', title: 'Belum dijadwalkan', outfit: '', acts: [] },
      ],
      activeBudget: 't4-awal',
      budgets: [
        { id: 't4-awal', name: 'Rencana awal', note: '', alloc: { 'Makan & minum': 800000, 'Transport': 600000, 'Tiket & atraksi': 400000, 'Penginapan': 800000, 'Lain': 100000 } },
      ],
      outfitSets: [],
      manual: [],
      packing: [],
      members: [],
    },
  ]
  // attach members
  for (const t of trips) t.members = seedMembers(t.id)
  // the live trip is mid-journey: its planned costs have actually been spent
  const live = trips.find((t) => t.status === 'live')
  if (live) for (const d of live.days) for (const a of d.acts) if (a.cost > 0) a.paid = true
  return trips
}
