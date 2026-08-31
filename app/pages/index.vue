<script setup lang="ts">
// Landing placeholder — real marketing page arrives in Phase 5.
definePageMeta({ layout: 'blank', public: true })
const session = useSessionStore()
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-16 text-center">
    <CoreLogo :size="44" :text-size="30" />
    <h1 class="font-display text-[40px] leading-[1.1] font-600 max-w-[560px]">
      Rencana jalan, anggaran, dan barang di satu tempat.
    </h1>
    <p class="text-[16px] text-ink-2 max-w-[460px]">
      Catat pengeluaran sambil jalan, biar tahu sisa anggaran sebelum hari terakhir.
    </p>
    <div class="flex gap-3">
      <NuxtLink :to="session.authed ? '/beranda' : '/masuk'">
        <CoreButton variant="primary">Coba gratis</CoreButton>
      </NuxtLink>
      <NuxtLink to="/masuk"><CoreButton variant="ghost">Masuk</CoreButton></NuxtLink>
    </div>
  </main>
</template>
