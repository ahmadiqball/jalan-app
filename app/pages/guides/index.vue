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
    <!-- hero: art blended into the page (multiply); big, slight bleed past the container, in-flow so never clipped -->
    <div class="bg-paper overflow-x-clip">
      <div class="max-w-[1240px] mx-auto px-[20px] md:px-[32px] flex flex-col md:flex-row md:items-center">
        <div class="relative z-[2] md:w-[46%] md:shrink-0 py-[36px] md:py-[76px]">
          <h1 class="font-display text-[clamp(40px,8vw,68px)] font-700 text-ink leading-[0.96]">Kelana Guides</h1>
          <p class="text-[15.5px] md:text-[18px] text-ink-2 mt-4 max-w-[42ch] leading-snug">
            Panduan destinasi yang dikurasi dengan teliti, untuk perjalanan yang lebih mudah dan berkesan.
          </p>
        </div>
        <div class="md:flex-1 md:min-w-0 flex justify-center md:justify-end md:-mr-[4%] pb-4 md:pb-0">
          <img src="/img/guides-hero.webp" alt="Kelana Guides" style="mix-blend-mode:multiply" class="w-full max-w-[760px] h-auto object-contain select-none pointer-events-none">
        </div>
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
