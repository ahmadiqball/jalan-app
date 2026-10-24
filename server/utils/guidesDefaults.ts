import type { Destination, Place } from '../repositories/types'

/**
 * Seed catalog for local/dev (memory repos) and as the reference shape for the
 * Supabase tables. Two fully-curated examples: Bali and Banda Neira. Images are
 * placeholders — galleries are self-hosted URLs in production (never Google
 * Photos). Populate cloud via POST /api/admin/guides/seed (admin only).
 */
export function defaultDestinations(): Destination[] {
  return [
    {
      id: 'dest-bali',
      slug: 'bali',
      name: 'Bali',
      region: 'Indonesia',
      heroImage: '/img/art-bali.webp',
      cardImage: '/img/photo-ubud.jpg',
      summary:
        'Bali menawarkan perpaduan pantai yang indah, budaya yang kaya, kuliner beragam, dan alam yang menakjubkan — dari Ubud sampai Nusa Lembongan.',
      bestTime: 'Apr–Okt',
      idealDuration: '5–7 hari',
      goodFor: ['Pasangan', 'Keluarga', 'Solo traveler'],
      tripTypes: ['Pantai', 'Budaya', 'Kuliner'],
      tips: [
        'Sewa motor untuk menjelajah lebih bebas, tapi hati-hati di jalur ramai.',
        'Bawa uang tunai — banyak warung lokal belum menerima kartu.',
        'Datang ke tempat populer pagi hari untuk menghindari keramaian.',
      ],
      aliases: ['bali', 'ubud', 'seminyak', 'kuta', 'canggu', 'denpasar', 'uluwatu', 'sanur', 'jimbaran', 'lembongan'],
      featured: true,
      published: true,
      sort: 1,
    },
    {
      id: 'dest-banda',
      slug: 'banda-neira',
      name: 'Banda Neira',
      region: 'Indonesia',
      heroImage: '/img/photo-sumba.jpg',
      cardImage: '/img/photo-sumba.jpg',
      summary:
        'Kepulauan rempah di Maluku — sejarah pala, benteng kolonial, dan laut paling jernih di Indonesia timur. Surga sunyi untuk penyelam dan pecinta sejarah.',
      bestTime: 'Sep–Nov',
      idealDuration: '4–6 hari',
      goodFor: ['Petualang', 'Penyelam', 'Pecinta sejarah'],
      tripTypes: ['Sejarah', 'Bahari', 'Alam'],
      tips: [
        'Terbang ke Ambon dulu, lalu lanjut pesawat perintis atau kapal Pelni ke Banda.',
        'Bawa uang tunai cukup — ATM terbatas dan sering offline.',
        'Pesan homestay dan trip snorkeling jauh-jauh hari, terutama musim tenang.',
        'Musim laut tenang (Sep–Nov) paling ideal untuk menyeberang antar pulau.',
      ],
      aliases: ['banda', 'banda neira', 'neira', 'maluku', 'pala', 'banda islands', 'kepulauan banda', 'ambon'],
      featured: true,
      published: true,
      sort: 2,
    },
  ]
}

export function defaultPlaces(): Place[] {
  return [
    // ── Bali
    {
      id: 'pl-old-island', destinationId: 'dest-bali', name: 'Old Island Lembongan', type: 'hotel', area: 'Nusa Lembongan',
      priceText: 'Rp 750.000 / malam', priceLevel: 2, rating: 4.7, ratingCount: 128,
      tags: ['Pantai', 'Suasana tenang', 'Cocok untuk pasangan', 'Pemandangan laut'],
      shortDesc: 'Pemandangan pinggir pantai dengan lokasi yang sunyi, jauh dari bar, dan hanya 8 menit motoran dari pelabuhan.',
      longDesc: 'Old Island Lembongan adalah akomodasi tepi pantai dengan suasana yang tenang dan jauh dari keramaian bar. Terletak hanya 8 menit motoran dari pelabuhan, tempat ini menawarkan pemandangan laut yang indah dan cocok untuk kamu yang ingin menikmati suasana pulau dengan lebih santai.',
      gallery: [], goodToKnow: ['Pesan jauh hari saat high season.', 'Tersedia restoran di area penginapan.', 'Disarankan membawa perlengkapan snorkeling.'],
      openHours: 'Check-in 14.00', badge: 'Pilihan Kelana', featured: true, sort: 1,
    },
    {
      id: 'pl-taman-beji', destinationId: 'dest-bali', name: 'Taman Beji Uluwatu', type: 'hotel', area: 'Uluwatu',
      priceText: 'Rp 1.500.000 / malam', priceLevel: 3, rating: 4.8, ratingCount: 96,
      tags: ['Tebing', 'Sunset', 'Suasana tenang'],
      shortDesc: 'Resort tebing dengan pemandangan sunset yang menakjubkan dan suasana tenang.',
      gallery: [], sort: 2,
    },
    {
      id: 'pl-munduk', destinationId: 'dest-bali', name: 'Munduk Moding Plantation', type: 'hotel', area: 'Munduk',
      priceText: 'Rp 2.400.000 / malam', priceLevel: 4, rating: 4.9, ratingCount: 210,
      tags: ['Pegunungan', 'Udara sejuk', 'Infinity pool'],
      shortDesc: 'Resort di tengah alam dengan pemandangan pegunungan dan udara sejuk.',
      gallery: [], sort: 3,
    },
    {
      id: 'pl-dapur-kecil', destinationId: 'dest-bali', name: 'Dapur Kecil Lembongan', type: 'makan', area: 'Jungutbatu, Nusa Lembongan',
      priceText: 'Rp 80–150 rb/orang', priceLevel: 2, rating: 4.7, ratingCount: 320,
      tags: ['Makan & minum', 'Tepi pantai', 'Lokal'],
      shortDesc: 'Tempat makan santai untuk menikmati hidangan lokal setelah menjelajahi Lembongan.',
      longDesc: 'Dapur Kecil Lembongan adalah restoran sederhana di tepi pantai Jungutbatu yang menyajikan hidangan lokal dan internasional dengan suasana santai.',
      gallery: [], goodToKnow: ['Datang sebelum pukul 12.00 untuk menghindari antrean.', 'Siapkan uang tunai; metode pembayaran bisa berbeda.', 'Cocok untuk makan siang setelah aktivitas pantai.'],
      openHours: 'Setiap hari 08.00–22.00', sort: 4,
    },
    {
      id: 'pl-paddleboard', destinationId: 'dest-bali', name: 'Paddleboard Lembongan', type: 'aktivitas', area: 'Mushroom Bay',
      priceText: 'Rp 100 rb/orang', priceLevel: 1, rating: 4.6, ratingCount: 189,
      tags: ['Aktivitas', 'Air', 'Pagi hari'],
      shortDesc: 'Sewa paddleboard dan jelajahi teluk yang tenang di pagi hari.',
      gallery: [], badge: 'Cocok pagi hari', sort: 5,
    },
    {
      id: 'pl-the-deck', destinationId: 'dest-bali', name: 'The Deck Café & Bar', type: 'makan', area: 'Jungutbatu',
      priceText: 'Rp 100–200 rb/orang', priceLevel: 2, rating: 4.5, ratingCount: 276,
      tags: ['Makan & minum', 'Pemandangan laut', 'Sunset'],
      shortDesc: 'Kafe tepi laut dengan pemandangan sunset terbaik di Lembongan.',
      gallery: [], badge: 'Pemandangan laut', sort: 6,
    },
    {
      id: 'pl-tegallalang', destinationId: 'dest-bali', name: 'Tegallalang Rice Terrace', type: 'hidden_gem', area: 'Ubud',
      priceText: 'Rp 25 rb/orang', priceLevel: 1, rating: 4.7, ratingCount: 412,
      tags: ['Hidden gem', 'Sawah', 'Foto'],
      shortDesc: 'Sawah terasering ikonik — paling bagus dikunjungi pagi hari sebelum ramai.',
      gallery: [], sort: 7,
    },

    // ── Banda Neira
    {
      id: 'pl-banda-cilu', destinationId: 'dest-banda', name: 'Cilu Bintang Estate', type: 'hotel', area: 'Banda Neira',
      priceText: 'Rp 450.000 / malam', priceLevel: 2, rating: 4.7, ratingCount: 86,
      tags: ['Heritage', 'Kolonial', 'Tepi laut', 'Tenang'],
      shortDesc: 'Guesthouse bergaya kolonial dengan taman rempah, beberapa langkah dari dermaga tua.',
      longDesc: 'Cilu Bintang Estate dibangun ulang mengikuti arsitektur kolonial Banda, lengkap dengan furnitur kayu dan taman pala. Lokasinya dekat dermaga dan Benteng Belgica, menjadikannya basis yang nyaman untuk menjelajah pulau utama dan menyeberang ke spot snorkeling.',
      gallery: [], goodToKnow: ['Pesan jauh hari saat musim tenang (Sep–Nov).', 'Pemilik bisa bantu atur trip snorkeling dan pemandu sejarah.', 'Sarapan termasuk; menu ikan segar dan buah pala.'],
      openHours: 'Check-in 14.00', badge: 'Pilihan Kelana', featured: true, sort: 1,
    },
    {
      id: 'pl-banda-mutiara', destinationId: 'dest-banda', name: 'Mutiara Guesthouse', type: 'hotel', area: 'Banda Neira',
      priceText: 'Rp 300.000 / malam', priceLevel: 1, rating: 4.5, ratingCount: 64,
      tags: ['Homestay', 'Tepi laut', 'Ramah'],
      shortDesc: 'Homestay tepi laut yang hangat dengan teras menghadap Gunung Api.',
      gallery: [], openHours: 'Check-in 13.00', sort: 2,
    },
    {
      id: 'pl-banda-delfika', destinationId: 'dest-banda', name: 'Delfika Café', type: 'makan', area: 'Banda Neira',
      priceText: 'Rp 40–90 rb/orang', priceLevel: 1, rating: 4.6, ratingCount: 178,
      tags: ['Makan & minum', 'Kopi', 'Pala', 'Santai'],
      shortDesc: 'Kafe legendaris dengan manisan pala, kopi lokal, dan suasana kolonial yang teduh.',
      longDesc: 'Delfika menjadi tempat berkumpul wisatawan sejak lama. Cobalah jus dan manisan pala khas Banda sambil menikmati bangunan tuanya yang teduh.',
      gallery: [], goodToKnow: ['Wajib coba manisan dan jus pala.', 'Buka dari pagi untuk sarapan.'],
      openHours: 'Setiap hari 07.00–22.00', badge: 'Khas pala', sort: 3,
    },
    {
      id: 'pl-banda-ikan', destinationId: 'dest-banda', name: 'Warung Ikan Bakar Nelayan', type: 'makan', area: 'Dekat Pasar Banda',
      priceText: 'Rp 50–100 rb/orang', priceLevel: 1, rating: 4.5, ratingCount: 92,
      tags: ['Makan & minum', 'Ikan bakar', 'Lokal'],
      shortDesc: 'Ikan segar hasil tangkapan hari itu, dibakar dengan sambal colo-colo khas Maluku.',
      gallery: [], openHours: 'Setiap hari 11.00–21.00', sort: 4,
    },
    {
      id: 'pl-banda-belgica', destinationId: 'dest-banda', name: 'Benteng Belgica', type: 'aktivitas', area: 'Banda Neira',
      priceText: 'Rp 25 rb/orang', priceLevel: 1, rating: 4.8, ratingCount: 240,
      tags: ['Sejarah', 'Benteng', 'Sunset', 'Foto'],
      shortDesc: 'Benteng bintang lima peninggalan VOC abad ke-17 dengan panorama pulau dan Gunung Api.',
      longDesc: 'Benteng Belgica dibangun Belanda pada 1611 untuk menguasai perdagangan pala. Naik ke menaranya saat sore untuk melihat Banda Neira, Gunung Api, dan laut dari ketinggian.',
      gallery: [], goodToKnow: ['Datang menjelang sunset untuk cahaya terbaik.', 'Bawa air; tangga menara cukup curam.'],
      openHours: 'Setiap hari 08.00–18.00', featured: true, sort: 5,
    },
    {
      id: 'pl-banda-gunungapi', destinationId: 'dest-banda', name: 'Pendakian Gunung Api Banda', type: 'aktivitas', area: 'Pulau Gunung Api',
      priceText: 'Pemandu Rp 150 rb', priceLevel: 2, rating: 4.7, ratingCount: 61,
      tags: ['Pendakian', 'Sunrise', 'Pemandangan'],
      shortDesc: 'Daki gunung berapi aktif sebelum fajar untuk sunrise 360 derajat di atas kepulauan.',
      longDesc: 'Pendakian menantang sekitar 2–3 jam ke puncak Gunung Api. Mulai dini hari dengan perahu dari Neira, ditemani pemandu lokal, demi sunrise yang tak terlupakan.',
      gallery: [], goodToKnow: ['Mulai sekitar pukul 03.00 dengan pemandu.', 'Gunakan sepatu yang menapak kuat; jalur berbatu.', 'Bawa senter dan air yang cukup.'],
      badge: 'Sunrise', sort: 6,
    },
    {
      id: 'pl-banda-hatta', destinationId: 'dest-banda', name: 'Pulau Hatta', type: 'hidden_gem', area: 'Kepulauan Banda',
      priceText: 'Sewa perahu Rp 700 rb/grup', priceLevel: 2, rating: 4.9, ratingCount: 143,
      tags: ['Snorkeling', 'Air jernih', 'Terpencil', 'Drop-off'],
      shortDesc: 'Dinding karang drop-off dengan visibilitas luar biasa — salah satu snorkeling terbaik di Banda.',
      longDesc: 'Pulau Hatta berjarak sekitar satu jam perahu dari Neira. Tepiannya langsung menurun ke dinding karang penuh ikan, cocok untuk snorkeling maupun diving dengan air sejernih kaca.',
      gallery: [], goodToKnow: ['Berangkat pagi saat laut tenang.', 'Bawa perlengkapan snorkeling sendiri bila bisa.', 'Sewa perahu dibagi per grup — lebih hemat ramai-ramai.'],
      badge: 'Snorkeling terbaik', featured: true, sort: 7,
    },
    {
      id: 'pl-banda-rumahbudaya', destinationId: 'dest-banda', name: 'Rumah Budaya Banda', type: 'aktivitas', area: 'Banda Neira',
      priceText: 'Rp 20 rb/orang', priceLevel: 1, rating: 4.5, ratingCount: 70,
      tags: ['Museum', 'Sejarah', 'Pala'],
      shortDesc: 'Museum kecil yang merekam sejarah perdagangan pala dan masa kolonial Banda.',
      gallery: [], openHours: 'Selasa–Minggu 09.00–16.00', sort: 8,
    },
    {
      id: 'pl-banda-lonthoir', destinationId: 'dest-banda', name: 'Kebun Pala Lonthoir', type: 'hidden_gem', area: 'Pulau Banda Besar',
      priceText: 'Rp 25 rb + pemandu', priceLevel: 1, rating: 4.6, ratingCount: 48,
      tags: ['Pala', 'Kebun', 'Sejarah', 'Sumur tua'],
      shortDesc: 'Jelajah kebun pala tua di Lonthoir, lengkap dengan sumur Belanda dan tangga seribu.',
      longDesc: 'Di Pulau Banda Besar, desa Lonthoir menyimpan kebun pala berusia ratusan tahun. Pemandu lokal menjelaskan proses panen pala dan fuli sambil mengajak ke sumur tua peninggalan Belanda.',
      gallery: [], goodToKnow: ['Sewa pemandu desa untuk cerita sejarahnya.', 'Pakai alas kaki nyaman; medan menanjak.'],
      sort: 9,
    },
  ]
}
