<script setup lang="ts">
import type { Destination } from '~/types/guide'

definePageMeta({ public: true })
useHead({ title: 'Guides · Kelana' })
const localePath = useLocalePath()

const { data } = await useFetch<Destination[]>('/api/guides', { key: 'guides-list' })
const destinations = computed(() => data.value ?? [])

const q = ref('')
const region = ref('Semua')
const regions = computed(() => ['Semua', ...Array.from(new Set(destinations.value.map((d) => d.region).filter(Boolean)))])
const featured = computed(() => destinations.value.filter((d) => d.featured))

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
    <!-- hero -->
    <div class="bg-sand-100 border-b border-sand-line">
      <div class="max-w-[1100px] mx-auto p-[40px_20px_34px] md:p-[52px_32px_40px]">
        <div class="eyebrow text-teal-700">Rekomendasi dari Kelana</div>
        <h1 class="font-display text-[clamp(30px,6vw,46px)] font-700 leading-[1.04] mt-2 max-w-[18ch]">Panduan destinasi yang dikurasi, untuk trip yang lebih bermakna.</h1>
        <div class="mt-5 max-w-[460px] relative">
          <i class="i-lucide-search absolute left-[15px] top-1/2 -translate-y-1/2 text-[17px] text-muted" />
          <input v-model="q" placeholder="Cari destinasi atau negara…" class="field !pl-[42px] !py-[13px] bg-white">
        </div>
      </div>
    </div>

    <div class="max-w-[1100px] mx-auto p-[26px_20px_64px] md:p-[30px_32px_72px] flex flex-col gap-7">
      <!-- featured -->
      <section v-if="featured.length && region === 'Semua' && !q">
        <div class="font-display text-[20px] font-600 mb-3">Panduan pilihan</div>
        <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
          <GuideDestinationCard v-for="d in featured" :key="d.id" :destination="d" />
        </div>
      </section>

      <!-- region filter + grid -->
      <section>
        <div class="flex gap-2 flex-wrap mb-4">
          <button
            v-for="r in regions"
            :key="r"
            class="rounded-pill px-[14px] py-[8px] text-[13px] font-600 border transition-colors"
            :class="region === r ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
            @click="region = r"
          >{{ r }}</button>
        </div>
        <div v-if="shown.length" class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
          <GuideDestinationCard v-for="d in shown" :key="d.id" :destination="d" />
        </div>
        <div v-else class="card p-10 text-center text-muted text-[14px]">Belum ada panduan yang cocok.</div>
      </section>
    </div>
  </div>
</template>
