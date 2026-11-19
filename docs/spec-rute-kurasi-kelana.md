# Spec: Rute Kelana & Kurasi Kelana

Status: draf untuk direview · 18 Nov 2026

## Masalah

Di halaman template, pengguna hanya melihat nama, jumlah hari, dan total biaya ("Bali · 5 hari · Rp 4,2 jt"). Tidak ada penjelasan kenapa trip itu layak dipilih, jadi pengguna tidak yakin untuk memakainya.

Kebutuhan pengguna: *"Ketika aku mau liburan tapi tidak tahu mulai dari mana, aku ingin rencana yang sudah dipikirkan orang yang paham, supaya aku yakin perjalananku bagus tanpa riset berjam-jam."*

## Dua fitur, dua peran

| | **Kurasi Kelana** (dulu: Kelana Guides) | **Rute Kelana** (dulu: Template) |
|---|---|---|
| Isi | Katalog tempat dan aktivitas per lokasi | Satu trip lengkap: hari, aktivitas, anggaran, barang |
| Cara pakai | Pilih tempat lalu masukkan ke trip yang sudah dibuat | "Buat trip serupa", lalu pengguna menyesuaikan sendiri |
| Analogi | Ensiklopedia destinasi | Cerita perjalanan yang siap ditiru |

Kata "kurasi" hanya dipakai untuk Kurasi Kelana.

## Rute Kelana: halaman cerita

Setiap rute punya halaman cerita bergaya majalah:

1. **Pembuka**: foto besar, judul ("Bali 5 Hari: Santai, Pantai & Ubud"), cocok untuk siapa, perkiraan biaya, waktu terbaik.
2. **Kenapa rute ini**: 2–3 kalimat dari kurator.
3. **Hari demi hari**: setiap hari punya judul; setiap aktivitas punya **"Kenapa ke sini"** dan **tips**.
4. **Ringkasan anggaran**: per kategori, bukan per item.
5. **Penutup**: tombol **"Buat trip serupa"** dengan catatan *"Semua bisa kamu ubah: hari, tempat, dan anggaran."*
6. Tombol "Buat trip serupa" selalu terlihat (menempel di bawah layar di HP).

**Sumber isi:** "Kenapa ke sini" dan tips ditulis di setiap aktivitas saat menyusun rute di admin. Halaman cerita dibuat dari data itu, tidak ditulis terpisah. Saat pengguna membuat trip serupa, catatan ini ikut tersalin ke trip mereka.

**Nanti (bukan sekarang):** aktivitas di rute bisa ditautkan ke tempat di Kurasi Kelana.

## Akses

- Rute Kelana dan Kurasi Kelana termasuk dalam **paket berbayar yang sama**.
- Admin menandai **1–2 rute sebagai Gratis**. Pengguna gratis bisa membaca rute itu penuh dan membuat trip darinya.
- Rute berbayar tetap muncul di daftar dengan ikon 🔒. Pengguna gratis bisa melihat **pembuka + Hari 1**; sisanya terkunci dengan ajakan upgrade.
- Halaman cerita bisa dibuka tanpa login, agar bisa dibagikan dan ditemukan di Google.
- Paywall baru diaktifkan setelah ada sekitar 5–6 rute. Sebelum itu semua rute terbuka.

## Admin

- Ganti label menu "Template" menjadi "Rute Kelana" dan "Panduan" menjadi "Kurasi Kelana".
- Rute mendapat status **Draf/Tayang**. Saat ini template baru langsung terlihat semua pengguna begitu dibuat; ini harus diubah.
- Rute mendapat tanda **Gratis**.
- Field baru per rute: judul cerita, "kenapa rute ini", cocok untuk siapa, waktu terbaik.
- Field baru per hari: judul hari.
- Field baru per aktivitas: "kenapa ke sini", tips.

## Ganti nama & URL

- Semua teks "Kelana Guides"/"Guides" menjadi "Kurasi Kelana"; "Template" menjadi "Rute Kelana" (navbar, beranda, landing page, halaman langganan, judul halaman, ID & EN).
- URL baru: `/kurasi` dan `/rute`. URL lama `/guides` dan `/template` dialihkan otomatis.

## Bukan bagian dari pekerjaan ini

- Kuota "pilih 2 rute bebas" (Opsi B), yang mungkin dipertimbangkan nanti.
- Penautan aktivitas rute ke tempat di Kurasi Kelana.
- Bukti sosial ("dipakai 120 orang").

## Asumsi yang perlu diuji

1. **Pengguna mau membaca.** Paling berisiko. Tunjukkan satu halaman cerita (misalnya Bali 5 Hari) ke 3–5 calon pengguna sebelum membangun editor admin selengkapnya.
2. **Alasan membuat pengguna yakin**, lebih dari foto atau harga saja.
3. **Kurator sanggup menulis** cukup banyak rute untuk mengisi katalog.

## Pertanyaan terbuka

- Apa nama paket berbayarnya di halaman upgrade?
- Apakah 2 template yang ada sekarang akan ditulis ulang menjadi rute pertama?

## Usulan urutan pengerjaan

1. Ganti nama dan URL (kecil, bisa langsung dirilis).
2. Status Draf/Tayang untuk rute (mencegah rute setengah jadi terlihat pengguna).
3. Field cerita di admin + halaman cerita Rute Kelana.
4. Tanda Gratis + rute terkunci + ajakan upgrade.
