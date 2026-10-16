import type { Destination, Place } from '../repositories/types'

/**
 * Seed catalog for local/dev (memory repos) and as the reference shape for the
 * Supabase tables. Images are placeholders — galleries are self-hosted URLs in
 * production (never Google Photos).
 */
export function defaultDestinations(): Destination[] {
  return [
    {
      id: 'dest-bali',
      slug: 'bali',
      name: 'Bali',
      region: 'Indonesia',
      heroImage: '/img/photo-ubud.jpg',
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
      id: 'dest-lombok',
      slug: 'lombok',
      name: 'Lombok',
      region: 'Indonesia',
      heroImage: '/img/photo-sumba.jpg',
      summary: 'Pantai sunyi, air terjun, dan Gili yang tenang — Lombok untuk yang mencari suasana lebih santai dari Bali.',
      bestTime: 'Mei–Sep',
      idealDuration: '4–6 hari',
      goodFor: ['Pasangan', 'Backpacker'],
      tripTypes: ['Pantai', 'Alam'],
      tips: ['Siapkan perlengkapan snorkeling untuk trip Gili.'],
      aliases: ['lombok', 'mataram', 'senggigi', 'kuta lombok', 'gili'],
      featured: true,
      published: true,
      sort: 2,
    },
    {
      id: 'dest-jogja',
      slug: 'yogyakarta',
      name: 'Yogyakarta',
      region: 'Indonesia',
      heroImage: '/img/photo-bromo.jpg',
      summary: 'Pusat budaya Jawa — candi, kuliner legendaris, dan keramahan khas Jogja.',
      bestTime: 'Apr–Okt',
      idealDuration: '3–5 hari',
      goodFor: ['Keluarga', 'Solo traveler'],
      tripTypes: ['Budaya', 'Kuliner'],
      tips: ['Beli tiket sunrise Borobudur jauh-jauh hari.'],
      aliases: ['yogya', 'jogja', 'yogyakarta', 'sleman', 'bantul', 'malioboro', 'prambanan', 'borobudur'],
      featured: false,
      published: true,
      sort: 3,
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
    // ── Lombok
    {
      id: 'pl-gili-t', destinationId: 'dest-lombok', name: 'Gili Trawangan Sunset Point', type: 'aktivitas', area: 'Gili Trawangan',
      priceText: 'Gratis', priceLevel: 1, tags: ['Pantai', 'Sunset'],
      shortDesc: 'Titik sunset terbaik di sisi barat Gili Trawangan.', gallery: [], sort: 1,
    },
    {
      id: 'pl-warung-lombok', destinationId: 'dest-lombok', name: 'Warung Ayam Taliwang', type: 'makan', area: 'Mataram',
      priceText: 'Rp 40–80 rb/orang', priceLevel: 1, rating: 4.6, ratingCount: 150, tags: ['Makan & minum', 'Pedas', 'Lokal'],
      shortDesc: 'Ayam taliwang khas Lombok yang pedas dan legendaris.', gallery: [], sort: 2,
    },
    // ── Yogyakarta
    {
      id: 'pl-gudeg', destinationId: 'dest-jogja', name: 'Gudeg Yu Djum', type: 'makan', area: 'Wijilan',
      priceText: 'Rp 25–50 rb/orang', priceLevel: 1, rating: 4.5, ratingCount: 540, tags: ['Makan & minum', 'Legendaris'],
      shortDesc: 'Gudeg legendaris Jogja — manis dan gurih.', gallery: [], sort: 1,
    },
    {
      id: 'pl-prambanan', destinationId: 'dest-jogja', name: 'Candi Prambanan', type: 'aktivitas', area: 'Sleman',
      priceText: 'Rp 50 rb/orang', priceLevel: 2, rating: 4.8, ratingCount: 980, tags: ['Budaya', 'Candi', 'Sunset'],
      shortDesc: 'Candi Hindu terbesar di Indonesia — ambil tiket sunset.', gallery: [], badge: 'Pilihan Kelana', featured: true, sort: 2,
    },
  ]
}
