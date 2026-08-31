<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)
</script>

<template>
  <div class="min-h-screen bg-paper flex flex-col items-center justify-center gap-6 px-6 text-center">
    <CoreLogo :size="38" :text-size="26" />
    <div class="font-display text-[40px] font-600">{{ is404 ? 'Halaman tidak ada' : 'Ada yang salah' }}</div>
    <p class="text-[15px] text-ink-2 max-w-[420px]">
      {{ is404 ? 'Tautan yang kamu buka mungkin sudah berubah atau tidak ada.' : 'Coba muat ulang halaman. Kalau masih bermasalah, kembali ke beranda.' }}
    </p>
    <div class="flex gap-3">
      <CoreButton variant="primary" @click="clearError({ redirect: '/beranda' })">Ke Beranda</CoreButton>
      <CoreButton variant="ghost" @click="clearError({ redirect: '/' })">Ke halaman utama</CoreButton>
    </div>
  </div>
</template>
