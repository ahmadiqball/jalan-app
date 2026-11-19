// Six curated routes. Costs are totals for 2 people, rough estimates.
const A = (time, title, cat, place, cost, dur, x = {}) => ({ time, title, cat, place, cost, dur, ...x })
const D = (title, story, acts) => ({ title, story, acts })
const T = 'Tiket & atraksi', M = 'Makan & minum', R = 'Transport', S = 'Santai', B = 'Belanja'

export const ROUTES = [
{
  id: 'tpl-bandung-3', name: 'Bandung 3 hari', place: 'Bandung, Jawa Barat', mat: 'alam', slug: 'bandung-3-hari',
  intro: 'Tiga hari di Bandung dengan satu hari ke selatan, satu hari di dalam kota, dan satu hari ke utara. Kamu menginap di satu hotel, jadi tidak perlu bongkar koper. Dua kawah dan satu tebing pagi ada di hari yang berbeda supaya tiap hari punya satu hal besar saja.',
  reasons: [
    'Satu hotel di sekitar Dago atau Braga selama dua malam. Ciwidey di selatan dan Lembang di utara sama-sama bisa dicapai sekitar satu sampai dua jam dari sana.',
    'Kawah Putih dan Tangkuban Perahu sengaja dipisah hari. Keduanya paling bagus di pagi hari sebelum kabut naik, jadi masing-masing perlu pagi sendiri.',
    'Hari tengah dipakai di dalam kota, dengan jalan kaki yang pendek-pendek. Badan sempat istirahat sebelum berangkat pagi lagi.',
  ],
  goodFor: 'Pasangan, keluarga kecil, akhir pekan panjang', bestTime: 'Mei-September',
  alloc: { 'Penginapan': 1200000, 'Transport': 1400000, 'Makan & minum': 900000, 'Tiket & atraksi': 400000, 'Belanja': 300000 },
  cover: 'Kawah Putih Ciwidey.jpg',
  packing: [['Dokumen', [['KTP', 1]]], ['Pakaian', [['Jaket tipis', 1], ['Sepatu yang nyaman dipakai jalan']]], ['Perlengkapan', [['Senter kecil untuk Tebing Keraton'], ['Masker, untuk bau belerang']]]],
  days: [
    D('Selatan: Kawah Putih dan kebun teh', 'Berangkat pagi dari hotel. Ke Ciwidey sekitar dua jam kalau jalannya lancar, dan akhir pekan bisa lebih lama, jadi berangkat sebelum jam tujuh.', [
      A('07.00', 'Mobil sewa ke Ciwidey', R, 'Ciwidey', 800000, 120, { tip: 'Sewa mobil dengan sopir seharian cukup untuk hari ini. Sepakati harga dan jam pulang sejak awal.' }),
      A('09.30', 'Kawah Putih', T, 'Kawah Putih', 150000, 120, {
        what: 'Danau kawah dengan air yang berubah dari hijau muda sampai putih susu, dikelilingi tebing pucat dan bau belerang tipis.',
        why: 'Pemandangan paling khas di selatan Bandung. Suhunya sejuk bahkan di siang hari.',
        tip: 'Datang pagi. Menjelang siang kabut sering turun dan danaunya tidak kelihatan. Batasi waktu di tepi kawah kalau kamu sensitif pada bau belerang.', photo: 'Kawah Putih Ciwidey.jpg' }),
      A('12.30', 'Makan siang di Ciwidey', M, 'Ciwidey', 150000, 75),
      A('14.30', 'Kebun teh Rancabali', S, 'Rancabali', 40000, 90, { what: 'Hamparan kebun teh di jalan antara Kawah Putih dan Situ Patenggang.', tip: 'Berhenti di titik pandang tepi jalan saja sudah cukup.' }),
    ]),
    D('Kota: Gedung Sate dan Braga', 'Hari ini tidak ada yang jauh. Hampir semua bisa dijangkau dengan jalan kaki atau ojek online yang pendek.', [
      A('09.00', 'Gedung Sate', T, 'Gedung Sate', 20000, 90, {
        what: 'Gedung pemerintahan peninggalan Belanda dengan menara berhias tusuk sate di puncaknya.',
        why: 'Bangunan yang paling mudah dikenali di Bandung, dan taman di depannya enak untuk jalan pagi.',
        tip: 'Cek jam buka museum di dalamnya sebelum datang.', photo: 'Gedung Sate Oktober 2024 - Rahmatdenas.jpg' }),
      A('11.30', 'Jalan kaki di Jalan Braga', S, 'Jalan Braga', 0, 120, {
        what: 'Jalan tua dengan bangunan art deco, kafe, dan toko-toko lama.',
        why: 'Dari sini ke Alun-Alun sekitar 20 menit jalan kaki, jadi kamu bisa menyambung tanpa naik kendaraan.', photo: 'Braga Street 2023.jpg' }),
      A('13.30', 'Makan siang di sekitar Braga', M, 'Jalan Braga', 200000, 90),
      A('15.30', 'Alun-Alun dan Masjid Raya', S, 'Alun-Alun Bandung', 0, 75),
      A('18.30', 'Batagor dan mie kocok', M, 'Bandung', 150000, 90),
    ]),
    D('Utara: Tebing Keraton dan Tangkuban Perahu', 'Hari terpanjang dan paling pagi. Mulai gelap dari hotel supaya kamu sudah ada di tebing waktu langit mulai terang.', [
      A('05.00', 'Sunrise di Tebing Keraton', S, 'Tebing Keraton', 45000, 120, {
        what: 'Tebing di tepi hutan Dago Pakar dengan pemandangan lembah yang sering tertutup kabut tipis di pagi hari.',
        why: 'Salah satu tempat sunrise yang paling mudah dijangkau dari kota, sekitar 30 menit dari Dago.',
        tip: 'Berangkat dari hotel sebelum jam lima. Jalan naiknya gelap, jadi bawa senter dan jaket.', photo: 'Tebing Keraton 09.jpg' }),
      A('08.30', 'Sarapan di Lembang', M, 'Lembang', 100000, 60),
      A('10.00', 'Tangkuban Perahu', T, 'Tangkuban Perahu', 200000, 150, {
        what: 'Gunung berapi dengan beberapa kawah yang bisa dilihat dari bibirnya. Kawah Ratu paling besar dan paling mudah dicapai.',
        why: 'Sekitar 45 menit dari kota. Kemarin kamu melihat danau kawah, di sini kawahnya kering dan berbatu.',
        tip: 'Tanya petugas di loket apakah semua kawah dibuka hari itu. Aktivitas gunung kadang menutup sebagian area.', photo: 'Tangkuban Perahu Java72.jpg' }),
      A('14.00', 'Oleh-oleh di Lembang', B, 'Lembang', 300000, 90),
      A('16.00', 'Mobil ke Stasiun Bandung', R, 'Stasiun Bandung', 150000, 60),
    ]),
  ],
},
{
  id: 'tpl-jakarta-3', name: 'Jakarta 3 hari', place: 'Jakarta', mat: 'kota', slug: 'jakarta-3-hari',
  intro: 'Tiga hari di Jakarta yang disusun per wilayah supaya macet tidak memakan harimu. Hari pertama kota tua di utara, hari kedua pusat kota dengan Monas dan museum, hari ketiga santai lalu pulang.',
  reasons: [
    'Tiap hari hanya satu wilayah. Jakarta luas dan macet, jadi pindah wilayah di tengah hari biasanya menghabiskan satu jam lebih.',
    'Kota Tua, Glodok, dan Sunda Kelapa berdekatan, jadi hari pertama bisa ditempuh dengan jalan kaki dan satu kali ojek.',
    'Menginap di sekitar Thamrin atau Sarinah. Stasiun MRT dan halte TransJakarta ada di dekatnya, dan Monas bisa ditempuh jalan kaki.',
  ],
  goodFor: 'Pasangan, teman, transit panjang', bestTime: 'Mei-September',
  alloc: { 'Penginapan': 1600000, 'Transport': 500000, 'Makan & minum': 1300000, 'Tiket & atraksi': 300000, 'Belanja': 300000 },
  cover: 'Jakarta Panorama.jpg',
  packing: [['Dokumen', [['KTP', 1], ['Kartu e-money untuk KRL, MRT, dan TransJakarta', 1]]], ['Pakaian', [['Sepatu yang nyaman dipakai jalan', 1], ['Pakaian sopan untuk Masjid Istiqlal']]], ['Perlengkapan', [['Payung lipat'], ['Powerbank']]]],
  days: [
    D('Kota Tua dan Pecinan', 'Hari ini paling banyak jalan kaki. Pakai sepatu yang enak, dan mulai pagi sebelum matahari terik.', [
      A('08.30', 'KRL ke Stasiun Jakarta Kota', R, 'Stasiun Jakarta Kota', 30000, 45),
      A('09.30', 'Kota Tua dan Museum Fatahillah', T, 'Kota Tua', 40000, 150, {
        what: 'Lapangan bekas pusat kota Batavia dengan gedung balai kota lama yang kini jadi museum.',
        why: 'Tempat paling jelas untuk melihat Jakarta sebelum jadi metropolitan, dan semuanya terjangkau dengan jalan kaki.',
        tip: 'Datang sebelum jam sepuluh. Lapangannya masih sepi dan belum terik.', photo: 'Batavia Fatahillah Square, Kota Tua Jakarta 06.jpg' }),
      A('13.00', 'Makan siang di Glodok', M, 'Glodok', 200000, 90, {
        what: 'Kawasan Pecinan lama dengan deretan pedagang makanan dan toko obat.',
        why: 'Sekitar 15 menit naik ojek dari Kota Tua, jadi urutannya pas setelah pagi di museum.', photo: 'Jakarta Indonesia Hawkers-in- Glodok-06.jpg' }),
      A('15.30', 'Pelabuhan Sunda Kelapa', T, 'Sunda Kelapa', 50000, 90, {
        what: 'Pelabuhan kayu tempat kapal pinisi bersandar.',
        why: 'Pelabuhan tertua di Jakarta, dan sore hari cahayanya bagus untuk foto.',
        tip: 'Tanyakan harga lebih dulu kalau mau naik perahu kecil keliling dermaga.', photo: 'Kapal Pinisi Sunda Kelapa.jpg' }),
    ]),
    D('Pusat kota: Monas, museum, dan masjid', 'Semua titik hari ini ada di sekitar Medan Merdeka, jadi bisa ditempuh dengan jalan kaki dan sesekali ojek.', [
      A('08.30', 'Monas', T, 'Monas', 50000, 120, {
        what: 'Tugu setinggi 132 meter di tengah Medan Merdeka. Kamu bisa naik lift ke pelataran dekat puncaknya.',
        why: 'Pemandangan kota dari atas, dan letaknya hanya jalan kaki dari hotel di Thamrin.',
        tip: 'Antrean lift panjang di akhir pekan. Datang saat buka.', photo: 'Monumen Nasional, Jakarta, Indonesia.jpg' }),
      A('11.00', 'Museum Nasional', T, 'Museum Nasional', 60000, 120, {
        what: 'Museum terbesar di Indonesia. Isinya arca, tekstil, dan peninggalan dari seluruh nusantara.',
        why: 'Gambaran Indonesia dalam satu gedung. Cocok kalau trip ini mau kamu sambung ke daerah lain.',
        tip: 'Sebagian gedung kadang ditutup untuk renovasi. Cek jam buka dan area yang dibuka lebih dulu.', photo: 'Jakarta Indonesia National-Museum-01.jpg' }),
      A('14.00', 'Makan siang di Sarinah', M, 'Sarinah', 200000, 90),
      A('15.30', 'Masjid Istiqlal dan Katedral', S, 'Masjid Istiqlal', 0, 90, {
        what: 'Masjid terbesar di Asia Tenggara berhadapan dengan Gereja Katedral, dan keduanya dihubungkan terowongan.',
        why: 'Dua bangunan besar yang berdampingan, dan jaraknya hanya beberapa menit jalan kaki dari Monas.',
        tip: 'Berpakaian sopan dan lepas alas kaki. Hindari datang saat jam salat kalau kamu bukan jamaah.', photo: 'Istiqlal Mosque Jakarta prayer hall interior view 04.jpg' }),
      A('18.30', 'Makan malam di Thamrin', M, 'Thamrin', 300000, 120),
    ]),
    D('Belanja, makan, dan pulang', 'Hari ini ringan. Bandara jauh dari pusat kota, jadi berangkatlah dengan jeda yang cukup.', [
      A('09.30', 'Pasar Baru', B, 'Pasar Baru', 300000, 150, { what: 'Kawasan belanja lama dengan toko tekstil, sepatu, dan oleh-oleh.', tip: 'Harga biasa ditawar, terutama di toko kecil.' }),
      A('13.00', 'Makan siang', M, 'Pasar Baru', 200000, 90),
      A('15.00', 'Ke Bandara Soekarno-Hatta', R, 'Bandara Soekarno-Hatta', 200000, 90, { tip: 'Dari pusat kota butuh 60 sampai 90 menit, dan lebih lama saat jam sibuk. Kereta Bandara dari Stasiun BNI City lebih pasti waktunya.' }),
    ]),
  ],
},
{
  id: 'tpl-yogyakarta-5', name: 'Yogyakarta 5 hari', place: 'Yogyakarta, DI Yogyakarta', mat: 'budaya', slug: 'yogyakarta-5-hari',
  intro: 'Lima hari dengan satu hotel di kota. Dua candi, kraton dan Taman Sari, Merapi, lalu pantai selatan. Hari pertama dan terakhir sengaja ringan.',
  reasons: [
    'Satu hotel di sekitar Malioboro selama empat malam. Semua tujuan dicapai pergi-pulang dari sana dan tidak ada yang lebih dari dua jam.',
    'Borobudur dan Prambanan ada di arah yang berlawanan, jadi tiap candi mendapat harinya sendiri dan tidak ada hari yang terlalu penuh.',
    'Kraton buka sampai sekitar tengah hari, jadi hari ketiga dimulai dari Prambanan lalu turun ke kota.',
    'Merapi paling jelas di pagi hari. Sorenya kamu bergeser ke selatan: hutan pinus dan Parangtritis untuk matahari terbenam.',
  ],
  goodFor: 'Pasangan, keluarga, pencinta sejarah', bestTime: 'Mei-September',
  alloc: { 'Penginapan': 2800000, 'Transport': 2200000, 'Makan & minum': 2000000, 'Tiket & atraksi': 1400000, 'Belanja': 400000 },
  cover: 'Yogyakarta Indonesia Prambanan-temple-complex-02.jpg',
  packing: [['Dokumen', [['KTP', 1]]], ['Pakaian', [['Pakaian sopan untuk candi dan kraton', 1], ['Kacamata hitam dan topi']]], ['Perlengkapan', [['Sunblock'], ['Masker dan kacamata untuk lava tour', 1]]]],
  days: [
    D('Tiba dan Malioboro', 'Hari pertama hanya untuk sampai dan beradaptasi. Malioboro paling hidup sore sampai malam.', [
      A('11.00', 'Tiba dan check-in', R, 'Yogyakarta', 300000, 90),
      A('13.00', 'Gudeg untuk makan siang', M, 'Yogyakarta', 120000, 75),
      A('17.00', 'Jalan di Malioboro', S, 'Malioboro', 0, 150, {
        what: 'Jalan utama kota yang ramai pedagang batik, kerajinan, dan makanan.',
        why: 'Dekat dari hotel dan tidak perlu rencana. Cukup jalan dan berhenti kalau ada yang menarik.',
        tip: 'Tawar sebelum membeli batik atau suvenir. Simpan dompet di saku depan di keramaian.', photo: 'Malioboro di Waktu Senja-1.jpg' }),
      A('19.30', 'Makan malam lesehan', M, 'Malioboro', 200000, 90),
    ]),
    D('Borobudur', 'Hari ini kamu keluar kota ke arah Magelang. Berangkat sebelum jam enam supaya tiba saat candi baru dibuka dan belum panas.', [
      A('05.30', 'Mobil ke Borobudur', R, 'Candi Borobudur', 700000, 75, { tip: 'Sewa mobil dengan sopir seharian cukup. Ini juga dipakai untuk pulang dan makan siang.' }),
      A('06.45', 'Candi Borobudur', T, 'Candi Borobudur', 100000, 180, {
        what: 'Candi Buddha abad kesembilan dengan sembilan tingkat dan ratusan relief di dindingnya.',
        why: 'Warisan dunia UNESCO dan alasan utama banyak orang datang ke Yogyakarta. Pagi hari lebih sejuk dan lebih sepi.',
        tip: 'Naik ke tingkat atas dibatasi kuota dan harus lewat tiket resmi. Beli lebih awal lewat situs resmi, dan pakai sandal khusus yang disediakan.', photo: 'Borobudur Sunrise 2012-01-05.jpg' }),
      A('11.30', 'Makan siang di Magelang', M, 'Magelang', 150000, 75),
      A('16.30', 'Sore santai di Alun-Alun Kidul', S, 'Alun-Alun Kidul', 30000, 90, { tip: 'Tradisi masangin, berjalan menutup mata di antara dua beringin, biasa dicoba pengunjung. Sewa kain penutup mata di sana.' }),
    ]),
    D('Prambanan, kraton, dan Taman Sari', 'Urutan hari ini mengikuti jam buka. Kraton tutup sekitar tengah hari, jadi candi didahulukan.', [
      A('07.30', 'Candi Prambanan', T, 'Candi Prambanan', 100000, 150, {
        what: 'Kompleks candi Hindu abad kesembilan dengan menara-menara tinggi yang meruncing.',
        why: 'Menara tengahnya kelihatan jauh lebih tinggi di pagi hari dengan cahaya miring, dan pengunjungnya masih sedikit.',
        tip: 'Datang saat buka. Menjelang siang batu candinya panas dan tidak ada tempat berteduh.', photo: 'Prambanan temple, Central Java, Indonesia, 20220818 1311 9139.jpg' }),
      A('11.00', 'Kraton Yogyakarta', T, 'Kraton Yogyakarta', 30000, 90, {
        what: 'Istana sultan yang masih jadi tempat tinggal dan pusat upacara. Sebagian bangunannya dibuka sebagai museum.',
        why: 'Gambaran paling langsung soal budaya Jawa yang masih berjalan, bukan hanya peninggalan.',
        tip: 'Jam buka berhenti sekitar tengah hari, dan hari tertentu tutup. Cek dulu sebelum berangkat.', photo: 'Yogyakarta Indonesia Kraton-the-Sultans-Palace-02.jpg' }),
      A('13.30', 'Makan siang', M, 'Kraton Yogyakarta', 150000, 75),
      A('15.00', 'Taman Sari', T, 'Taman Sari', 30000, 90, {
        what: 'Bekas taman istana dengan kolam pemandian, lorong bawah tanah, dan menara.',
        why: 'Hanya sekitar 10 menit dari Kraton, jadi bisa disambung langsung.',
        tip: 'Pemandu lokal di pintu masuk menawarkan jasa. Sepakati tarifnya sebelum mulai.', photo: 'Taman Sari Water Castle, Yogyakarta, 20220818 1035 8919.jpg' }),
    ]),
    D('Merapi, hutan pinus, dan pantai selatan', 'Pagi di utara, sore di selatan. Itu berarti banyak di jalan, tetapi tiap perhentian cukup singkat.', [
      A('06.00', 'Lava tour Merapi dengan jip', T, 'Kaliurang', 700000, 240, {
        what: 'Jip terbuka yang membawamu ke bekas aliran lahar dan desa-desa di lereng Merapi.',
        why: 'Cara paling praktis melihat gunung dari dekat. Paketnya sudah termasuk sopir yang hafal medan.',
        tip: 'Pakai masker dan kacamata. Jalurnya berdebu dan jipnya terbuka. Pilih paket yang jelas rutenya.', photo: 'Lava Tour Jogja.jpg' }),
      A('11.30', 'Makan siang di Kaliurang', M, 'Kaliurang', 150000, 75),
      A('15.00', 'Hutan Pinus Mangunan', S, 'Hutan Pinus Mangunan', 20000, 90, {
        what: 'Hutan pinus yang teduh dengan jalan setapak dan titik pandang ke lembah di bawahnya.',
        why: 'Teduh di jam panas, dan arahnya searah dengan pantai selatan.', photo: 'Hutan Pinus Mangunan Yogyakarta 1.jpg' }),
      A('17.15', 'Matahari terbenam di Parangtritis', S, 'Pantai Parangtritis', 20000, 90, {
        what: 'Pantai berpasir gelap di Samudra Hindia dengan ombak besar dan gumuk pasir di sekitarnya.',
        why: 'Pantai paling dekat dari kota, dan sore hari cahayanya bagus.',
        tip: 'Ombaknya besar dan arusnya kuat. Jangan berenang di sini, cukup berjalan di tepi.', photo: 'Panorama of Parangtritis Beach on a cloudy afternoon (2).jpg' }),
    ]),
    D('Oleh-oleh dan pulang', 'Bandara baru Yogyakarta ada di Kulon Progo, sekitar satu setengah jam dari kota. Sisakan waktu untuk itu.', [
      A('08.30', 'Sarapan dan Pasar Beringharjo', B, 'Pasar Beringharjo', 400000, 120, { what: 'Pasar tradisional terbesar di kota, terkenal untuk batik dan jajanan.', tip: 'Tawar. Harga pertama biasanya jauh lebih tinggi.' }),
      A('11.00', 'Beli bakpia dan makan siang', M, 'Yogyakarta', 200000, 75),
      A('12.30', 'Ke Bandara Yogyakarta International', R, 'Bandara Yogyakarta International', 400000, 90, { tip: 'Kereta bandara dari Stasiun Tugu lebih pasti waktunya daripada mobil.' }),
    ]),
  ],
},
{
  id: 'tpl-bali-7', name: 'Bali 7 hari', place: 'Bali', mat: 'pulau', slug: 'bali-7-hari',
  intro: 'Tujuh hari yang bergerak dari tengah pulau ke tepi: dua malam di Ubud, satu malam di Sidemen, dua malam di Sanur untuk Nusa Penida, lalu satu malam di Uluwatu. Hotel hanya pindah tiga kali dan tidak ada hari yang menyeberang pulau dua kali.',
  reasons: [
    'Dimulai dari yang paling tenang. Ubud dan Sidemen membuat badan terbiasa dulu sebelum kamu menghadapi jalan sempit dan antrean di pantai.',
    'Nusa Penida dipakai sebagai satu hari penuh dari Sanur, karena pelabuhan kapal cepatnya ada di sana. Pergi pagi, kembali sore.',
    'Uluwatu ada di akhir karena ujung selatan dekat dengan bandara, sekitar satu jam kalau lalu lintas lancar, jadi hari pulang tidak terburu-buru.',
    'Hari keempat sengaja ringan: pagi di Sidemen, sore pindah ke Sanur. Kamu masih segar untuk Nusa Penida di hari berikutnya.',
  ],
  goodFor: 'Pasangan, bulan madu, pertama kali ke Bali', bestTime: 'April-Oktober',
  alloc: { 'Penginapan': 4200000, 'Transport': 3000000, 'Makan & minum': 3000000, 'Tiket & atraksi': 1200000, 'Belanja': 500000 },
  cover: 'Tegallalang Rice Terraces Bali.jpg',
  packing: [['Dokumen', [['KTP', 1]]], ['Pakaian', [['Sarung atau kain untuk pura', 1], ['Baju renang']]], ['Perlengkapan', [['Sunblock', 1], ['Obat mabuk laut untuk Nusa Penida'], ['Uang tunai untuk pura dan warung kecil']]]],
  days: [
    D('Tiba dan Ubud', 'Dari bandara ke Ubud sekitar satu setengah jam. Hari ini cukup satu jalan sore dan makan malam yang tenang.', [
      A('11.00', 'Mobil dari bandara ke Ubud', R, 'Ubud', 450000, 100),
      A('16.00', 'Campuhan Ridge Walk', S, 'Campuhan Ridge', 0, 90, {
        what: 'Jalan setapak di punggung bukit dengan alang-alang di kedua sisinya, tidak jauh dari pusat Ubud.',
        why: 'Gratis, tidak menanjak berat, dan cocok untuk menyambut hari pertama.',
        tip: 'Pergi sore supaya tidak terik. Beberapa kafe di ujung jalan bisa jadi tempat berhenti.', photo: 'Campuhan ridge walk Ubud Bali 20120827b.jpg' }),
      A('19.00', 'Makan malam di Ubud', M, 'Ubud', 300000, 90),
    ]),
    D('Sawah Tegallalang dan Tirta Empul', 'Dua tempat ke arah utara Ubud, dan keduanya paling bagus sebelum tengah hari.', [
      A('08.00', 'Sawah terasering Tegallalang', S, 'Tegallalang', 40000, 120, {
        what: 'Sawah berundak di lembah dengan jalan setapak di sela-selanya.',
        why: 'Pemandangan Bali yang paling sering dibayangkan orang, dan hanya sekitar 30 menit dari pusat Ubud.',
        tip: 'Pagi lebih sepi dan lebih sejuk. Beberapa titik foto meminta donasi kecil.', photo: 'Rice terraces, Bali.jpg' }),
      A('11.00', 'Pura Tirta Empul', T, 'Pura Tirta Empul', 100000, 90, {
        what: 'Pura dengan kolam mata air suci tempat umat Hindu melakukan pembersihan diri.',
        why: 'Salah satu pura yang paling aktif dipakai untuk upacara. Kamu bisa melihat langsung ritualnya.',
        tip: 'Pakai kain dan selendang yang disediakan di pintu. Kalau mau ikut mandi suci, bawa pakaian ganti dan ikuti arahan petugas.', photo: 'Pura Tirta Empul 2017-08-18 (31).jpg' }),
      A('13.30', 'Makan siang di Ubud', M, 'Ubud', 200000, 75),
      A('16.00', 'Santai dan belanja kerajinan', B, 'Ubud', 300000, 120),
    ]),
    D('Pindah ke Sidemen', 'Perjalanan ke Sidemen sekitar satu jam setengah. Tidak ada jadwal ketat setelah tiba.', [
      A('10.00', 'Mobil ke Sidemen', R, 'Sidemen', 450000, 90),
      A('13.00', 'Makan siang dan check-in', M, 'Sidemen', 150000, 90),
      A('16.00', 'Jalan sore di sawah Sidemen', S, 'Sidemen', 0, 90, {
        what: 'Lembah sawah di kaki Gunung Agung dengan jalan kecil yang bisa dilewati jalan kaki atau sepeda.',
        why: 'Jauh lebih sepi dari Ubud, dan pemandangan sawahnya mirip.', photo: 'SIDEMEN EAST BALI RICE TERRACE.jpg' }),
    ]),
    D('Pagi di Sidemen, sore ke Sanur', 'Pagi dipakai untuk menikmati lembah sebelum pindah ke Sanur sekitar satu setengah jam.', [
      A('08.00', 'Sarapan dan jalan pagi', S, 'Sidemen', 100000, 120),
      A('12.30', 'Mobil ke Sanur', R, 'Sanur', 450000, 90),
      A('16.00', 'Sore santai di Pantai Sanur', S, 'Pantai Sanur', 0, 120, { what: 'Pantai yang tenang dengan ombak kecil dan jalan setapak di tepinya.', tip: 'Beli tiket kapal cepat Nusa Penida hari ini supaya besok tidak buru-buru di loket.' }),
    ]),
    D('Seharian di Nusa Penida', 'Berangkat pagi dengan kapal cepat dari Sanur, sekitar 40 menit. Di pulau kamu pindah antar titik dengan mobil sewa, dan jalannya sempit dan bergelombang.', [
      A('07.30', 'Kapal cepat ke Nusa Penida', R, 'Nusa Penida', 500000, 60),
      A('09.00', 'Mobil keliling Nusa Penida', R, 'Nusa Penida', 700000, 360, { tip: 'Sewa mobil dengan sopir lokal. Jalannya curam dan banyak yang tidak beraspal baik.' }),
      A('10.00', 'Kelingking Beach', T, 'Kelingking Beach', 50000, 120, {
        what: 'Tebing tinggi yang bentuknya seperti kepala dinosaurus, dengan pantai kecil di bawahnya.',
        why: 'Titik paling terkenal di pulau, dan pemandangan dari atasnya cukup untuk dinikmati tanpa turun.',
        tip: 'Jalan turun ke pantai curam dan licin. Pakai sepatu yang baik dan jangan memaksakan kalau tidak yakin.', photo: 'Kelingking Beach (T-Rex Bay) of Nusa Penida, Bali (2025) - img 09.jpg' }),
      A('16.00', 'Kapal kembali ke Sanur', R, 'Sanur', 0, 60, { tip: 'Cek jadwal kapal terakhir pagi harinya. Cuaca buruk bisa menunda penyeberangan.' }),
    ]),
    D('Pindah ke Uluwatu', 'Di hari ini kamu bergerak ke selatan. Pantai di siang hari, pura saat matahari mulai turun.', [
      A('09.30', 'Mobil ke Uluwatu', R, 'Uluwatu', 450000, 90),
      A('13.00', 'Pantai Padang Padang', S, 'Padang Padang', 20000, 120, {
        what: 'Pantai kecil di antara tebing karang dengan pasir putih dan air jernih.',
        why: 'Hanya sekitar 15 menit dari hotel di Uluwatu, jadi kamu tidak perlu pindah jauh.',
        tip: 'Datang saat air surut kalau mau berenang. Pantainya sempit dan ramai di akhir pekan.', photo: 'Padang Padang Beach Bali.jpg' }),
      A('16.30', 'Pura Uluwatu dan tarian kecak', T, 'Pura Luhur Uluwatu', 200000, 150, {
        what: 'Pura di ujung tebing tinggi di atas Samudra Hindia. Tarian kecak dipentaskan menjelang matahari terbenam.',
        why: 'Gabungan pemandangan laut dan pertunjukan dalam satu tempat.',
        tip: 'Jaga kacamata, topi, dan ponsel dari monyet di area pura. Kain disediakan di pintu.', photo: 'Luhur Uluwatu Temple, Bali, 20220826 0953 1016.jpg' }),
    ]),
    D('Pulang', 'Bandara sekitar satu jam dari Uluwatu kalau lalu lintas lancar.', [
      A('09.00', 'Sarapan dan oleh-oleh', B, 'Uluwatu', 200000, 120),
      A('12.00', 'Mobil ke Bandara Ngurah Rai', R, 'Bandara Ngurah Rai', 300000, 75, { tip: 'Berangkat lebih awal untuk penerbangan sore. Jalan menuju bandara sering padat.' }),
    ]),
  ],
},
{
  id: 'tpl-belitung-4', name: 'Belitung 4 hari', place: 'Belitung, Bangka Belitung', mat: 'pantai', slug: 'belitung-4-hari',
  intro: 'Empat hari di Belitung: pantai dan pulau-pulau di pesisir barat, satu hari ke timur untuk museum dan kopi, lalu danau kaolin sebelum pulang. Pulaunya kecil, jadi kamu cukup menginap di Tanjung Pandan.',
  reasons: [
    'Satu hotel di Tanjung Pandan. Pantai barat dicapai dalam 30 sampai 45 menit, dan timur sekitar dua jam, jadi tidak perlu pindah penginapan.',
    'Island hopping ada di hari kedua. Hari pertama sengaja ringan supaya kamu bisa melihat cuaca dan kondisi laut dulu sebelum menyewa perahu.',
    'Hari ketiga ke timur sengaja dibuat sebagai hari mobil. Kamu melewati kebun dan kota-kota kecil yang tidak terlihat dari pesisir barat.',
    'Danau Kaolin dekat dari Tanjung Pandan, jadi pas dipakai sebagai penutup di pagi hari terakhir sebelum ke bandara.',
  ],
  goodFor: 'Pasangan, teman, pencinta pantai', bestTime: 'Maret-Oktober',
  alloc: { 'Penginapan': 2100000, 'Transport': 2400000, 'Makan & minum': 1600000, 'Tiket & atraksi': 1200000, 'Belanja': 300000 },
  cover: 'Pantai Tanjung Tinggi Belitung 01.jpg',
  packing: [['Dokumen', [['KTP', 1]]], ['Pakaian', [['Baju renang', 1], ['Topi lebar']]], ['Perlengkapan', [['Sunblock yang aman untuk karang', 1], ['Dry bag untuk perahu'], ['Masker snorkel pribadi']]]],
  days: [
    D('Tiba dan Pantai Tanjung Tinggi', 'Dari bandara ke Tanjung Tinggi sekitar 45 menit. Sore ini cukup untuk satu pantai saja.', [
      A('11.00', 'Mobil sewa dari bandara', R, 'Tanjung Pandan', 600000, 60, { tip: 'Sewa mobil dengan sopir selama empat hari lebih murah daripada mencarinya tiap hari. Sepakati harga dari awal.' }),
      A('13.00', 'Makan siang di Tanjung Pandan', M, 'Tanjung Pandan', 150000, 75),
      A('15.30', 'Pantai Tanjung Tinggi', S, 'Pantai Tanjung Tinggi', 20000, 150, {
        what: 'Pantai berpasir putih dengan batu granit besar di tepi dan di dalam air.',
        why: 'Lokasi syuting film Laskar Pelangi, dan matahari terbenam dari sana jelas.',
        tip: 'Bawa sandal untuk batu yang licin. Air lebih tenang di sisi yang terlindung batu.', photo: 'Pantai Tanjung Tinggi Belitung 02.jpg' }),
    ]),
    D('Island hopping', 'Satu hari penuh di laut. Berangkat dari Tanjung Kelayang sekitar jam delapan supaya laut masih tenang.', [
      A('08.00', 'Perahu island hopping', T, 'Tanjung Kelayang', 700000, 360, {
        what: 'Perahu sewaan yang berhenti di beberapa pulau kecil dan karang di lepas pantai.',
        why: 'Laut jernih dengan batu granit besar, dan cara paling mudah melihat banyak titik dalam satu hari.',
        tip: 'Harga biasanya per perahu, bukan per orang. Tanya titik berhenti dan minta perlengkapan snorkel sudah termasuk.', photo: 'Pantai Tanjung Kelayang 01.jpg' }),
      A('10.30', 'Pulau Lengkuas dan mercusuar', T, 'Pulau Lengkuas', 100000, 90, {
        what: 'Pulau kecil dengan mercusuar peninggalan Belanda yang bisa dinaiki.',
        why: 'Dari puncaknya kelihatan gugusan pulau di sekitar. Dasar laut di sekelilingnya dangkal untuk snorkeling.',
        tip: 'Tangga mercusuar sempit dan dibatasi jumlah orangnya. Antre sebelum jam sepuluh.', photo: 'Mercusuar Pulau Lengkuas.jpg' }),
      A('13.00', 'Makan siang ikan bakar di pantai', M, 'Tanjung Kelayang', 250000, 90),
    ]),
    D('Timur: Gantong dan Manggar', 'Hari mobil. Dari Tanjung Pandan ke Gantong sekitar satu setengah jam, lalu sedikit lagi ke Manggar. Berangkat pagi supaya tidak pulang terlalu malam.', [
      A('08.00', 'Mobil ke Gantong', R, 'Gantong', 0, 100),
      A('10.00', 'Museum Kata Andrea Hirata', T, 'Gantong', 30000, 90, { what: 'Museum di Gantong yang terinspirasi dari novel Laskar Pelangi.', why: 'Menyambung cerita Tanjung Tinggi di hari pertama.', tip: 'Cek jam buka sebelum datang.' }),
      A('12.30', 'Makan siang di Manggar', M, 'Manggar', 150000, 75),
      A('14.00', 'Kopi di warung kopi Manggar', M, 'Manggar', 60000, 75, { what: 'Kota yang terkenal dengan warung kopi tuanya, tempat orang berkumpul sejak pagi.', tip: 'Pesan kopi hitam dan roti kaya bersama kue tradisional.' }),
      A('16.00', 'Kembali ke Tanjung Pandan', R, 'Tanjung Pandan', 0, 120),
    ]),
    D('Danau Kaolin dan pulang', 'Bandara sekitar 20 menit dari Tanjung Pandan, jadi pagi masih cukup longgar.', [
      A('08.30', 'Danau Kaolin', S, 'Danau Kaolin', 20000, 90, {
        what: 'Danau bekas tambang kaolin yang airnya biru kehijauan dengan tepian putih.',
        why: 'Dekat dari kota, jadi cocok sebagai penutup sebelum ke bandara.',
        tip: 'Tepian bekas tambang bisa labil. Jaga jarak dari pinggir yang curam.', photo: 'Danau Kaolin Belitung.jpg' }),
      A('10.30', 'Beli keripik dan kerupuk', B, 'Tanjung Pandan', 300000, 75, { what: 'Kerupuk dan keripik ikan khas Belitung, banyak dijual di toko oleh-oleh dekat pusat kota.' }),
      A('12.30', 'Makan siang dan ke bandara', R, 'Bandara H.A.S. Hanandjoeddin', 200000, 90),
    ]),
  ],
},
{
  id: 'tpl-sumba-7', name: 'Sumba 7 hari', place: 'Sumba, Nusa Tenggara Timur', mat: 'pantai', slug: 'sumba-7-hari',
  intro: 'Tujuh hari melintasi Sumba dari timur ke barat. Bagian timur dengan bukit savana dan kampung tenun, lalu bagian barat dengan kampung adat, air terjun, dan pantai. Kamu tiba di Waingapu dan pulang dari Tambolaka, jadi tidak ada hari yang terbuang untuk kembali.',
  reasons: [
    'Rute satu arah dari Waingapu ke Tambolaka. Satu hari penuh di tengah dipakai menyeberang pulau, tetapi tidak ada jalan yang diulang.',
    'Bagian timur dulu karena lanskapnya terbuka dan mudah. Kamu terbiasa dengan jalan Sumba sebelum masuk ke barat yang lebih jauh dan berkelok.',
    'Jarak antar titik di Sumba jauh dan jalannya lambat. Karena itu tiap hari hanya diisi dua sampai tiga tujuan.',
    'Danau Weekuri jadi penutup di hari keenam karena tempat itu paling enak dinikmati tanpa terburu-buru.',
  ],
  goodFor: 'Pasangan, teman, fotografer', bestTime: 'Mei-Oktober',
  alloc: { 'Penginapan': 4500000, 'Transport': 7500000, 'Makan & minum': 2800000, 'Tiket & atraksi': 800000, 'Belanja': 1500000 },
  budgetNote: 'Belum termasuk tiket pesawat. Sewa mobil di Sumba termasuk biaya terbesar, jadi bagi dengan teman perjalanan kalau bisa.',
  cover: 'Bukit Wairinding-Sumba Timur.jpg',
  packing: [['Dokumen', [['KTP', 1]]], ['Pakaian', [['Pakaian sopan untuk kampung adat', 1], ['Baju renang']]], ['Perlengkapan', [['Sunblock', 1], ['Uang tunai, ATM jarang di luar kota', 1], ['Sandal gunung untuk air terjun']]]],
  days: [
    D('Tiba di Waingapu dan Walakiri', 'Waingapu kota kecil di pantai timur. Hari ini sederhana: sampai, makan, lalu ke pantai untuk matahari terbenam.', [
      A('10.00', 'Tiba di Waingapu dan mobil sewa', R, 'Waingapu', 1000000, 60, { tip: 'Mobil dengan sopir lokal lebih masuk akal daripada menyetir sendiri. Sepakati harga sewa sampai Tambolaka sejak awal.' }),
      A('12.00', 'Makan siang di Waingapu', M, 'Waingapu', 120000, 75),
      A('15.30', 'Matahari terbenam di Pantai Walakiri', S, 'Pantai Walakiri', 20000, 150, {
        what: 'Pantai dengan pohon bakau yang tumbuh di air dangkal dan cabangnya membentuk siluet saat matahari turun.',
        why: 'Pantai paling terkenal di Sumba Timur, dan kira-kira satu setengah jam dari Waingapu.',
        tip: 'Pasang surut mengubah pemandangan. Datang saat air surut sedang untuk foto siluet pohonnya.', photo: 'Pantai Walakiri, Sumba Timur, Nusa Tenggara Timur 20170610.jpg' }),
    ]),
    D('Bukit Wairinding dan tenun Prailiu', 'Pagi ke bukit, sore kembali ke kota untuk melihat tenun yang dikerjakan langsung.', [
      A('07.00', 'Bukit Wairinding', S, 'Bukit Wairinding', 0, 120, {
        what: 'Bukit-bukit savana yang berlekuk seperti gelombang, hijau di musim hujan dan keemasan di musim kemarau.',
        why: 'Salah satu pemandangan paling khas Sumba Timur, dan cahaya pagi memberi bayangan yang jelas di lekuknya.',
        tip: 'Berangkat pagi. Kamu butuh sekitar satu jam setengah dari Waingapu, dan siang hari cahayanya datar.', photo: 'Bukit Wairinding, Sumba Timur.jpg' }),
      A('12.30', 'Makan siang di Waingapu', M, 'Waingapu', 120000, 75),
      A('15.00', 'Kampung tenun Prailiu', B, 'Prailiu', 800000, 120, {
        what: 'Kampung dekat Waingapu tempat kain ikat Sumba ditenun dan dicelup dengan pewarna alami.',
        why: 'Kamu bisa melihat langsung prosesnya, dan satu kain bisa memakan berbulan-bulan untuk selesai.',
        tip: 'Tanya bahan pewarna dan waktu pengerjaan sebelum menawar. Harga kain berkualitas memang tinggi.' }),
    ]),
    D('Menyeberang ke barat', 'Hari mobil. Waingapu ke Waikabubak sekitar empat jam, jadi berangkat pagi. Sorenya ada satu kampung adat yang tidak jauh dari hotel.', [
      A('07.30', 'Mobil ke Waikabubak', R, 'Waikabubak', 0, 240, { tip: 'Isi bensin dan beli air di Waingapu. Sepanjang jalan SPBU dan warung tidak banyak.' }),
      A('12.30', 'Makan siang di jalan', M, 'Waikabubak', 120000, 75),
      A('15.00', 'Kampung adat Praijing', T, 'Kampung Praijing', 50000, 90, {
        what: 'Kampung di atas bukit dengan rumah beratap alang-alang yang tinggi dan makam batu megalit di depannya.',
        why: 'Letaknya dekat dari Waikabubak, jadi bisa dikunjungi sore hari setelah perjalanan panjang.',
        tip: 'Minta izin dan sepakati donasi dengan warga sebelum masuk. Berpakaian sopan.', photo: 'Kampung Praijing.jpg' }),
    ]),
    D('Air terjun Lapopu', 'Hari ini ringan dan pendek. Lapopu sekitar satu setengah jam dari Waikabubak.', [
      A('08.30', 'Mobil ke Lapopu', R, 'Air Terjun Lapopu', 0, 90),
      A('10.00', 'Air Terjun Lapopu', S, 'Air Terjun Lapopu', 30000, 150, {
        what: 'Air terjun bertingkat di tengah hutan dengan kolam berwarna toska di bawahnya.',
        why: 'Titik teduh yang menyegarkan setelah dua hari di pantai dan bukit yang terik.',
        tip: 'Jalan ke kolam berbatu dan licin. Pakai sandal gunung dan jangan berenang kalau air sedang deras.', photo: 'Air Terjun Lapopu, Sumba Barat.jpg' }),
      A('14.00', 'Makan siang dan kembali ke Waikabubak', M, 'Waikabubak', 150000, 90),
    ]),
    D('Kodi: Ratenggaro dan Mandorak', 'Kodi ada di ujung barat daya, sekitar dua setengah jam dari Waikabubak. Malamnya kamu menginap di sekitar Tambolaka.', [
      A('07.30', 'Mobil ke Kodi', R, 'Kodi', 0, 150),
      A('10.30', 'Kampung adat Ratenggaro', T, 'Ratenggaro', 50000, 90, {
        what: 'Kampung dengan atap alang-alang menjulang dan deretan makam batu di tepi muara sungai dan laut.',
        why: 'Rumah-rumahnya termasuk yang paling tinggi di Sumba, dan letaknya persis di tepi laut.',
        tip: 'Sepakati donasi dengan warga di awal dan minta izin sebelum memotret orang.', photo: 'Kampung Adat Ratenggaro - Sumba Barat Daya.jpg' }),
      A('13.30', 'Makan siang di Kodi', M, 'Kodi', 120000, 75),
      A('15.30', 'Pantai Mandorak', S, 'Pantai Mandorak', 20000, 120, {
        what: 'Pantai dengan tebing karang tinggi di sisinya dan teluk kecil yang tersembunyi.',
        why: 'Searah dengan Ratenggaro, jadi bisa disambung hari yang sama.', photo: 'Pantai Mandorak, Sumba Barat Daya.jpg' }),
      A('17.30', 'Mobil ke Tambolaka', R, 'Tambolaka', 0, 120),
    ]),
    D('Danau Weekuri', 'Hari paling santai. Weekuri sekitar 45 menit dari Tambolaka.', [
      A('09.30', 'Mobil ke Weekuri', R, 'Danau Weekuri', 0, 60),
      A('10.30', 'Berenang di Danau Weekuri', S, 'Danau Weekuri', 25000, 240, {
        what: 'Laguna air asin di balik tebing karang yang terhubung ke laut, dengan air biru jernih.',
        why: 'Berenang di sini tenang walau laut di luarnya berombak, dan jadi penutup yang cocok setelah tiga hari penuh jalan.',
        tip: 'Bawa makanan ringan dan payung. Tidak banyak yang berjualan di sana.', photo: 'Danau Weekuri Sumba.jpg' }),
      A('17.00', 'Makan malam di Tambolaka', M, 'Tambolaka', 150000, 90),
    ]),
    D('Pulang', 'Bandara Tambolaka dekat dari kota, jadi pagi masih bisa ditempuh santai.', [
      A('08.30', 'Beli oleh-oleh', B, 'Tambolaka', 700000, 90, { what: 'Kain tenun dan kerajinan lokal di toko dekat kota.' }),
      A('11.00', 'Antar mobil ke bandara', R, 'Bandara Tambolaka', 0, 30),
    ]),
  ],
},
]
