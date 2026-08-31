<script setup lang="ts">
definePageMeta({ layout: 'blank', public: true })
useHead({ title: 'Jalan — rencana jalan, anggaran, dan barang' })
const session = useSessionStore()

const features = [
  { icon: 'i-lucide-wallet', title: 'Anggaran per kategori', body: 'Bikin beberapa versi anggaran — Hemat atau Nyaman — dan lihat sisa uang tiap kategori sambil jalan.' },
  { icon: 'i-lucide-luggage', title: 'Daftar barang otomatis', body: 'Checklist bawaan per grup, tanda wajib, sampai link beli. Tahu apa yang belum masuk tas.' },
  { icon: 'i-lucide-shirt', title: 'Outfit per hari', body: 'Pasang outfit untuk satu hari atau satu aktivitas. Muncul otomatis di rencana harian.' },
  { icon: 'i-lucide-calendar-days', title: 'Itinerary harian', body: 'Susun aktivitas per jam, hitung durasi dan biaya, semua rapi dalam satu linimasa.' },
  { icon: 'i-lucide-users', title: 'Rencana bareng', body: 'Undang teman, atur peran, dan biaya otomatis dibagi rata ke semua anggota.' },
  { icon: 'i-lucide-share-2', title: 'Bagikan tautan', body: 'Kirim versi baca-saja ke teman tanpa membocorkan angka anggaran.' },
]
const chips = ['Anggaran per kategori', 'Daftar barang otomatis', 'Outfit per hari']
</script>

<template>
  <div class="min-h-screen">
    <!-- nav -->
    <header class="max-w-[1200px] mx-auto px-6 py-5 flex items-center justify-between">
      <CoreLogo :size="32" :text-size="22" />
      <div class="flex items-center gap-3">
        <NuxtLink to="/masuk" class="text-[14px] font-600 text-ink-2 hover:text-teal-700 px-2">Masuk</NuxtLink>
        <NuxtLink :to="session.authed ? '/beranda' : '/masuk'"><CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[14px]">Coba gratis</CoreButton></NuxtLink>
      </div>
    </header>

    <!-- hero -->
    <section class="max-w-[1200px] mx-auto px-6 pt-10 pb-16 flex flex-wrap items-center gap-12">
      <div class="flex-1 min-w-[320px] flex flex-col gap-6">
        <h1 class="font-display text-[clamp(34px,5vw,52px)] leading-[1.08] font-600 [text-wrap:balance]">
          Rencana jalan, anggaran, dan barang di satu tempat.
        </h1>
        <p class="text-[17px] leading-[1.55] text-ink-2 max-w-[480px]">
          Catat pengeluaran sambil jalan, biar tahu sisa anggaran sebelum hari terakhir. Dibuat untuk jalan-jalan bareng.
        </p>
        <div class="flex gap-3">
          <NuxtLink :to="session.authed ? '/beranda' : '/masuk'"><CoreButton variant="primary">Coba versi hidup</CoreButton></NuxtLink>
          <NuxtLink to="/share/t1"><CoreButton variant="ghost">Lihat contoh trip</CoreButton></NuxtLink>
        </div>
        <div class="flex flex-wrap gap-2 text-[12.5px] font-700 text-teal-700">
          <span v-for="c in chips" :key="c" class="bg-teal-100 rounded-pill px-[13px] py-[7px]">{{ c }}</span>
        </div>
      </div>
      <div class="flex-1 min-w-[320px] relative">
        <div class="absolute -inset-6 bg-teal-100 rounded-hero z-[-1] rotate-1" />
        <img src="/img/screen-beranda.png" alt="Beranda Jalan" class="w-full rounded-[18px] border border-sand-line shadow-lift">
      </div>
    </section>

    <!-- features -->
    <section class="max-w-[1200px] mx-auto px-6 py-14">
      <div class="font-display text-[28px] font-600 text-center">Semua yang perlu, tidak lebih</div>
      <div class="grid gap-5 mt-8" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
        <div v-for="f in features" :key="f.title" class="card p-[22px]">
          <div class="w-[44px] h-[44px] rounded-[13px] bg-teal-100 text-teal-700 flex items-center justify-center"><i :class="f.icon" class="text-[22px]" /></div>
          <div class="font-display text-[18px] font-600 mt-3">{{ f.title }}</div>
          <div class="text-[14px] text-ink-2 mt-1 leading-[1.5]">{{ f.body }}</div>
        </div>
      </div>
    </section>

    <!-- collage -->
    <section class="max-w-[1200px] mx-auto px-6 py-10">
      <div class="grid gap-4" style="grid-template-columns:repeat(auto-fill,minmax(260px,1fr))">
        <img v-for="s in ['hari', 'anggaran', 'outfit']" :key="s" :src="`/img/screen-${s}.png`" :alt="s" class="w-full rounded-[14px] border border-sand-line shadow-card">
      </div>
    </section>

    <!-- cta -->
    <section class="max-w-[1200px] mx-auto px-6 py-16">
      <div class="bg-teal-600 rounded-hero p-[48px_32px] text-center text-white flex flex-col items-center gap-5">
        <div class="font-display text-[30px] font-600 [text-wrap:balance] max-w-[520px]">Trip berikutnya, tanpa drama anggaran.</div>
        <NuxtLink :to="session.authed ? '/beranda' : '/masuk'"><CoreButton variant="primary">Mulai gratis</CoreButton></NuxtLink>
      </div>
    </section>

    <footer class="max-w-[1200px] mx-auto px-6 py-10 border-t border-sand-line flex items-center justify-between flex-wrap gap-4">
      <CoreLogo :size="26" :text-size="18" />
      <div class="text-[13px] text-muted">Dibuat dengan Jalan · Bahasa Indonesia · Rupiah</div>
    </footer>
  </div>
</template>
