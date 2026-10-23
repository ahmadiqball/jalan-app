<script setup lang="ts">
import type { Destination } from '~/types/guide'

definePageMeta({ public: true })
useHead({ title: 'Kelana Guides' })

const { data, status } = useFetch<Destination[]>('/api/guides', { key: 'guides-list', lazy: true })
const destinations = computed(() => data.value ?? [])
const loading = computed(() => status.value === 'pending')

const q = ref('')
const region = ref('Semua')
const regions = computed(() => ['Semua', ...Array.from(new Set(destinations.value.map((d) => d.region).filter(Boolean)))])

const shown = computed(() => {
  const term = q.value.trim().toLowerCase()
  return destinations.value.filter((d) => {
    if (region.value !== 'Semua' && d.region !== region.value) return false
    if (!term) return true
    return (d.name + ' ' + d.region + ' ' + (d.aliases || []).join(' ')).toLowerCase().includes(term)
  })
})
</script>

<template>
  <div class="flex-1 w-full anim-rise">
    <!-- hero banner — swap the background for the supplied asset (e.g. /img/guides-hero.jpg) -->
    <div class="relative overflow-hidden">
      <div class="absolute inset-0 bg-cover bg-center" style="background-image:url('/img/photo-sumba.jpg')" />
      <div class="absolute inset-0" style="background:linear-gradient(104deg,rgba(16,38,43,.86) 0%,rgba(16,38,43,.6) 44%,rgba(16,38,43,.22) 100%)" />
      <div class="relative max-w-[1100px] mx-auto p-[46px_20px_42px] md:p-[66px_32px_56px]">
        <h1 class="font-display text-[clamp(32px,7vw,52px)] font-700 text-white leading-[1.02]">Kelana Guides</h1>
        <p class="text-[14.5px] md:text-[16.5px] text-white/90 mt-3 max-w-[46ch] leading-snug">
          Panduan destinasi yang dikurasi dengan teliti, untuk perjalanan yang lebih mudah dan berkesan.
        </p>
      </div>
    </div>

    <div class="max-w-[1100px] mx-auto p-[20px_20px_64px] md:p-[26px_32px_72px] flex flex-col gap-6">
      <!-- region filter + search -->
      <div class="flex items-center gap-3 flex-wrap">
        <div class="flex gap-2 flex-wrap flex-1 min-w-0">
          <button
            v-for="r in regions"
            :key="r"
            class="rounded-pill px-[14px] py-[8px] text-[13px] font-600 border transition-colors"
            :class="region === r ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
            @click="region = r"
          >{{ r }}</button>
        </div>
        <div class="relative w-full sm:w-[260px] shrink-0">
          <i class="i-lucide-search absolute left-[13px] top-1/2 -translate-y-1/2 text-[16px] text-muted" />
          <input v-model="q" placeholder="Cari destinasi atau tempat…" class="field !pl-[38px] !py-[10px] bg-white w-full">
        </div>
      </div>

      <!-- destinations grid -->
      <SkeletonCards v-if="loading" :count="8" />
      <div v-else-if="shown.length" class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(250px,100%),1fr))">
        <GuideDestinationCard v-for="d in shown" :key="d.id" :destination="d" />
      </div>
      <div v-else class="card p-10 text-center text-muted text-[14px]">
        {{ destinations.length ? 'Belum ada panduan yang cocok.' : 'Panduan akan segera hadir.' }}
      </div>
    </div>
  </div>
</template>
