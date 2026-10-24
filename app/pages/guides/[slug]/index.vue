<script setup lang="ts">
import type { GuideDetail } from '~/types/guide'
import { PLACE_TYPES } from '~/utils/guide'

definePageMeta({ public: true })
const route = useRoute()
const localePath = useLocalePath()
const { searchUrl } = useMaps()
const { flash } = useToast()
const trips = useTripsStore()
const session = useSessionStore()
const { templates } = useTemplatesList()
const { isSaved, toggle, refresh: refreshSaved } = useSaved()
const cloud = useIsCloud()
const slug = computed(() => route.params.slug as string)
onMounted(refreshSaved)

const { data: guide, error, status } = useFetch<GuideDetail>(() => `/api/guides/${slug.value}`, { key: `guide-${slug.value}`, lazy: true })
useHead(() => ({ title: (guide.value?.name ?? 'Panduan') + ' · Kelana Guides' }))

// "Gunakan panduan" — clone the linked itinerary template into a new trip, or
// start a trip seeded with the destination when none is linked. Auth-gated.
const using = ref(false)
async function useGuide() {
  if (!guide.value) return
  if (!session.authed) return navigateTo(localePath(`/masuk?next=${encodeURIComponent(route.fullPath)}`))
  using.value = true
  try {
    const owner = cloud ? { name: session.name, email: session.email } : undefined
    const tpl = guide.value.itineraryTemplateId ? templates.value.find((t) => t.id === guide.value!.itineraryTemplateId) : null
    const id = tpl
      ? trips.cloneTrip(tpl, { owner })
      : trips.createTrip({ name: guide.value.name, place: guide.value.name, owner })
    flash('Trip dibuat dari panduan')
    await navigateTo(localePath(`/trip/${id}/days`))
  } finally {
    using.value = false
  }
}

const savedGuide = computed(() => (guide.value ? isSaved('guide', guide.value.id) : false))
function onSaveGuide() {
  if (!guide.value) return
  if (!session.authed) return navigateTo(localePath(`/masuk?next=${encodeURIComponent(route.fullPath)}`))
  toggle('guide', guide.value.id)
}

const tab = ref<'ringkasan' | 'tempat' | 'peta' | 'tips'>('tempat')
const TABS = [
  ['ringkasan', 'Ringkasan'],
  ['tempat', 'Rekomendasi Tempat'],
  ['peta', 'Peta'],
  ['tips', 'Tips Perjalanan'],
] as const

const typeFilter = ref('all')
const places = computed(() => guide.value?.places ?? [])
const presentTypes = computed(() => PLACE_TYPES.filter((t) => places.value.some((p) => p.type === t.id)))
const shownPlaces = computed(() => (typeFilter.value === 'all' ? places.value : places.value.filter((p) => p.type === typeFilter.value)))
const placesWithLocation = computed(() => places.value.filter((p) => p.gmapsPlaceId || p.area || p.name))

const facts = computed(() => {
  const g = guide.value
  if (!g) return []
  return [
    ['i-lucide-calendar', 'Waktu terbaik', g.bestTime],
    ['i-lucide-clock', 'Durasi ideal', g.idealDuration],
    ['i-lucide-users', 'Cocok untuk', (g.goodFor || []).join(', ')],
    ['i-lucide-compass', 'Tipe perjalanan', (g.tripTypes || []).join(', ')],
  ].filter((x) => x[2]) as [string, string, string][]
})
</script>

<template>
  <div class="flex-1 w-full anim-rise">
    <div v-if="status === 'pending' && !guide">
      <div class="h-[230px] md:h-[280px] bg-sand-line animate-pulse" />
      <div class="max-w-[1000px] mx-auto p-[26px_20px_64px] md:p-[30px_32px_72px] flex flex-col gap-4">
        <CoreSkeleton class="h-7 w-1/3" />
        <CoreSkeleton class="h-4 w-1/2" />
        <SkeletonCards :count="6" />
      </div>
    </div>
    <div v-else-if="error || !guide" class="max-w-[700px] mx-auto p-16 text-center text-muted">
      Panduan tidak ditemukan. <NuxtLink :to="localePath('/guides')" class="text-teal-600 font-600">Kembali ke Guides</NuxtLink>
    </div>

    <template v-else>
      <!-- hero: destination art blended into the page; title left, big, in-flow so never clipped -->
      <div class="bg-paper overflow-x-clip">
        <div class="max-w-[1160px] mx-auto px-[20px] md:px-[32px] flex flex-col md:flex-row md:items-center">
          <div class="relative z-[2] md:w-[44%] md:shrink-0 pt-[24px] pb-3 md:py-[64px]">
            <NuxtLink :to="localePath('/guides')" class="inline-flex items-center gap-1 text-[12.5px] font-600 text-muted mb-3 hover:text-teal-700"><i class="i-lucide-chevron-left text-[15px]" /> Semua panduan</NuxtLink>
            <h1 class="font-display text-[clamp(34px,7vw,56px)] font-800 text-ink leading-[1.0]">{{ guide.name }}</h1>
            <div class="text-[13.5px] text-ink-2 mt-2">{{ guide.region }} · {{ places.length }} rekomendasi tempat</div>
            <div class="flex gap-2 mt-5 flex-wrap">
              <CoreButton variant="primary" class="!px-[16px] !py-[11px] !text-[13.5px]" :disabled="using" @click="useGuide">
                <i class="i-lucide-wand-sparkles text-[15px]" /> {{ using ? 'Membuat…' : 'Gunakan panduan untuk trip saya' }}
              </CoreButton>
              <CoreButton variant="ghost" class="!px-[15px] !py-[11px] !text-[13.5px]" @click="onSaveGuide">
                <i :class="savedGuide ? 'i-lucide-bookmark-check text-teal-700' : 'i-lucide-bookmark'" class="text-[15px]" /> {{ savedGuide ? 'Tersimpan' : 'Simpan' }}
              </CoreButton>
            </div>
          </div>
          <div class="md:flex-1 md:min-w-0 flex justify-center md:justify-end md:-mr-[4%] pb-4 md:pb-0">
            <img v-if="guide.heroImage" :src="guide.heroImage" :alt="guide.name" style="mix-blend-mode:multiply" class="w-full max-w-[720px] h-auto object-contain select-none pointer-events-none">
            <div v-else class="w-full max-w-[460px] h-[180px] md:h-[240px] rounded-card bg-sand-100 flex items-center justify-center text-muted"><i class="i-lucide-image text-[28px]" /></div>
          </div>
        </div>
      </div>

      <!-- tabs -->
      <div class="border-b border-sand-line sticky top-[68px] bg-paper z-20">
        <div class="max-w-[1000px] mx-auto px-[20px] md:px-[32px] flex gap-[2px] overflow-x-auto">
          <button
            v-for="[k, label] in TABS"
            :key="k"
            class="px-4 pt-[13px] pb-[13px] text-[14px] whitespace-nowrap border-b-[2.5px] transition-colors"
            :class="tab === k ? 'border-teal-600 text-ink font-700' : 'border-transparent text-muted font-500 hover:text-ink-2'"
            @click="tab = k"
          >{{ label }}</button>
        </div>
      </div>

      <div class="max-w-[1000px] mx-auto p-[26px_20px_64px] md:p-[30px_32px_72px]">
        <!-- Ringkasan -->
        <div v-if="tab === 'ringkasan'" class="flex flex-col gap-5 anim-rise-fast">
          <div>
            <div class="font-display text-[22px] font-600">Sekilas tentang {{ guide.name }}</div>
            <p class="text-[14.5px] text-ink-2 leading-[1.6] mt-2 max-w-[68ch]">{{ guide.summary }}</p>
          </div>
          <div class="grid gap-[12px]" style="grid-template-columns:repeat(auto-fill,minmax(min(230px,100%),1fr))">
            <div v-for="f in facts" :key="f[1]" class="card p-[14px_16px] flex items-start gap-3">
              <i :class="f[0]" class="text-[18px] text-teal-700 mt-[1px]" />
              <div><div class="text-[12px] text-muted font-600">{{ f[1] }}</div><div class="text-[14px] font-600 mt-[1px]">{{ f[2] }}</div></div>
            </div>
          </div>
        </div>

        <!-- Rekomendasi Tempat -->
        <div v-else-if="tab === 'tempat'" class="flex flex-col gap-4 anim-rise-fast">
          <div class="flex gap-2 flex-wrap">
            <button class="rounded-pill px-[13px] py-[7px] text-[12.5px] font-600 border transition-colors" :class="typeFilter === 'all' ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'" @click="typeFilter = 'all'">Semua ({{ places.length }})</button>
            <button
              v-for="t in presentTypes"
              :key="t.id"
              class="rounded-pill px-[13px] py-[7px] text-[12.5px] font-600 border transition-colors flex items-center gap-[6px]"
              :class="typeFilter === t.id ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
              @click="typeFilter = t.id"
            ><i :class="t.icon" class="text-[14px]" /> {{ t.label }} ({{ places.filter((p) => p.type === t.id).length }})</button>
          </div>
          <div v-if="shownPlaces.length" class="grid gap-[16px]" style="grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr))">
            <GuidePlaceCard v-for="p in shownPlaces" :key="p.id" :place="p" :slug="guide.slug" />
          </div>
          <div v-else class="card p-10 text-center text-muted text-[14px]">Belum ada tempat di kategori ini.</div>
        </div>

        <!-- Peta -->
        <div v-else-if="tab === 'peta'" class="flex flex-col gap-3 anim-rise-fast">
          <p class="text-[13.5px] text-muted">Buka tiap tempat langsung di Google Maps.</p>
          <div class="card divide-y divide-sand-100">
            <a v-for="p in placesWithLocation" :key="p.id" :href="searchUrl({ name: p.name, placeId: p.gmapsPlaceId }, guide.name)" target="_blank" rel="noopener" class="flex items-center gap-3 p-[13px_16px] hover:bg-sand-100 transition-colors">
              <i class="i-lucide-map-pin text-[16px] text-teal-700 shrink-0" />
              <div class="flex-1 min-w-0"><div class="text-[14px] font-600 truncate">{{ p.name }}</div><div v-if="p.area" class="text-[12px] text-muted truncate">{{ p.area }}</div></div>
              <i class="i-lucide-external-link text-[15px] text-muted shrink-0" />
            </a>
          </div>
        </div>

        <!-- Tips -->
        <div v-else class="flex flex-col gap-3 anim-rise-fast max-w-[68ch]">
          <div class="font-display text-[20px] font-600">Tips perjalanan</div>
          <div v-if="guide.tips?.length" class="card p-[16px_20px] flex flex-col gap-[11px]">
            <div v-for="(t, i) in guide.tips" :key="i" class="flex items-start gap-3 text-[14px] text-ink-2">
              <i class="i-lucide-lightbulb text-[16px] text-warn-fg shrink-0 mt-[2px]" /> <span>{{ t }}</span>
            </div>
          </div>
          <div v-else class="card p-8 text-center text-muted text-[14px]">Belum ada tips untuk panduan ini.</div>
        </div>
      </div>
    </template>
  </div>
</template>
