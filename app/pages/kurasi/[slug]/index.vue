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
const slug = computed(() => route.params.slug as string)
onMounted(refreshSaved)

const { data: guide, error, status } = useGuideResource<GuideDetail>(() => `/api/guides/${slug.value}`, () => `/api/member/guides/${slug.value}`, `guide-${slug.value}`)
useHead(() => ({ title: (guide.value?.name ?? 'Destinasi') + ' · Kurasi Kelana' }))

// "Gunakan panduan" — clone the linked itinerary template into a new trip, or
// start a trip seeded with the destination when none is linked. Auth-gated.
// a guide can link an itinerary template (admin-set); surfaced here, templates stay their own module
const linkedTemplate = computed(() => (guide.value?.itineraryTemplateId ? (templates.value.find((t) => t.id === guide.value!.itineraryTemplateId) || null) : null))
const { requireTripSlot } = useSubscription()
const usingTemplate = ref(false)
async function useTemplate() {
  const tpl = linkedTemplate.value
  if (!tpl) return
  if (!session.authed) return navigateTo(localePath(`/masuk?next=${encodeURIComponent(route.fullPath)}`))
  if (!requireTripSlot()) return
  usingTemplate.value = true
  try {
    const owner = { name: session.name, email: session.email }
    const id = trips.cloneTrip(tpl, { owner })
    flash('Trip dibuat dari rute')
    await navigateTo(localePath(`/trip/${id}/days`))
  } finally {
    usingTemplate.value = false
  }
}

const savedGuide = computed(() => (guide.value ? isSaved('guide', guide.value.id) : false))
function onSaveGuide() {
  if (!guide.value) return
  if (!session.authed) return navigateTo(localePath(`/masuk?next=${encodeURIComponent(route.fullPath)}`))
  toggle('guide', guide.value.id)
}

// tab + type filter live in the query string so Back from a place, refresh and shared links keep them
const router = useRouter()
const TABS = [
  ['tempat', 'Rekomendasi Tempat'],
  ['ringkasan', 'Ringkasan'],
  ['lokasi', 'Lokasi'],
  ['tips', 'Tips Perjalanan'],
] as const
type TabKey = (typeof TABS)[number][0]
const TAB_KEYS = TABS.map((t) => t[0]) as readonly TabKey[]
function setQuery(key: string, value: string | undefined) {
  router.replace({ query: { ...route.query, [key]: value } })
}
const tab = computed<TabKey>({
  get: () => (TAB_KEYS.includes(route.query.tab as TabKey) ? (route.query.tab as TabKey) : 'tempat'),
  set: (v) => setQuery('tab', v === 'tempat' ? undefined : v),
})
const typeFilter = computed<string>({
  get: () => (typeof route.query.tipe === 'string' ? route.query.tipe : 'all'),
  set: (v) => setQuery('tipe', v === 'all' ? undefined : v),
})

// roving arrow-key navigation between tabs (WAI-ARIA tabs pattern)
function onTabKey(e: KeyboardEvent, i: number) {
  const n = TABS.length
  const next = e.key === 'ArrowRight' ? (i + 1) % n : e.key === 'ArrowLeft' ? (i - 1 + n) % n : e.key === 'Home' ? 0 : e.key === 'End' ? n - 1 : -1
  if (next < 0) return
  e.preventDefault()
  const k = TABS[next]![0]
  tab.value = k
  document.getElementById(`tab-${k}`)?.focus()
}

const places = computed(() => guide.value?.places ?? [])
const presentTypes = computed(() => PLACE_TYPES.filter((t) => places.value.some((p) => p.type === t.id)))
const featuredCount = computed(() => places.value.filter((p) => p.featured).length)
const shownPlaces = computed(() => {
  if (typeFilter.value === 'all') return places.value
  if (typeFilter.value === 'featured') return places.value.filter((p) => p.featured)
  return places.value.filter((p) => p.type === typeFilter.value)
})
const typeCount = (id: string) => places.value.filter((p) => p.type === id).length

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
      Destinasi tidak ditemukan. <NuxtLink :to="localePath('/kurasi')" class="text-teal-600 font-600">Kembali ke Kurasi Kelana</NuxtLink>
    </div>

    <template v-else>
      <!-- hero: destination art blended into the page; title left, big, in-flow so never clipped -->
      <div class="bg-paper overflow-x-clip">
        <div class="max-w-[1160px] mx-auto px-[20px] md:px-[32px] flex flex-col md:flex-row md:items-center">
          <div class="relative z-[2] md:w-[40%] md:shrink-0 pt-[24px] pb-3 md:py-[64px]">
            <NuxtLink :to="localePath('/kurasi')" class="inline-flex items-center gap-1 text-[12.5px] font-600 text-muted mb-3 hover:text-teal-700"><i class="i-lucide-chevron-left text-[15px]" /> Semua destinasi</NuxtLink>
            <h1 class="font-display text-[clamp(34px,7vw,56px)] font-800 text-ink leading-[1.0]">{{ guide.name }}</h1>
            <div class="text-[13.5px] text-ink-2 mt-2">{{ guide.region }} · {{ places.length }} rekomendasi tempat</div>
            <div class="flex gap-2 mt-5 flex-wrap">
              <CoreButton v-if="linkedTemplate" variant="primary" class="!px-[16px] !py-[11px] !text-[13.5px]" :disabled="usingTemplate" @click="useTemplate">
                <i class="i-lucide-wand-sparkles text-[15px]" /> {{ usingTemplate ? 'Membuat…' : 'Buat trip dari rute' }}
              </CoreButton>
              <CoreButton variant="ghost" class="!px-[15px] !py-[11px] !text-[13.5px]" @click="onSaveGuide">
                <i :class="savedGuide ? 'i-lucide-bookmark-check text-teal-700' : 'i-lucide-bookmark'" class="text-[15px]" /> {{ savedGuide ? 'Tersimpan' : 'Simpan' }}
              </CoreButton>
            </div>
          </div>
          <div class="md:flex-1 md:min-w-0 flex justify-center md:justify-end pb-4 md:pb-0">
            <img v-if="guide.heroImage" :src="guide.heroImage" alt="" style="mix-blend-mode:multiply" class="w-full max-w-[680px] h-auto object-contain select-none pointer-events-none">
            <div v-else class="w-full max-w-[460px] h-[180px] md:h-[240px] rounded-card bg-sand-100 flex items-center justify-center text-muted"><i class="i-lucide-image text-[28px]" /></div>
          </div>
        </div>
      </div>

      <!-- tabs -->
      <div class="border-b border-sand-line sticky top-[68px] bg-paper z-20">
        <div class="max-w-[1000px] mx-auto px-[20px] md:px-[32px] flex gap-[2px] overflow-x-auto" role="tablist" aria-label="Bagian destinasi">
          <button
            v-for="([k, label], i) in TABS"
            :id="`tab-${k}`"
            :key="k"
            type="button"
            role="tab"
            :aria-selected="tab === k"
            aria-controls="kurasi-panel"
            :tabindex="tab === k ? 0 : -1"
            class="px-4 pt-[13px] pb-[13px] text-[14px] whitespace-nowrap border-b-[2.5px] transition-colors"
            :class="tab === k ? 'border-teal-600 text-ink font-700' : 'border-transparent text-muted font-500 hover:text-ink-2'"
            @click="tab = k"
            @keydown="onTabKey($event, i)"
          >{{ label }}</button>
        </div>
      </div>

      <div id="kurasi-panel" role="tabpanel" :aria-labelledby="`tab-${tab}`" class="max-w-[1000px] mx-auto p-[26px_20px_64px] md:p-[30px_32px_72px]">
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

          <!-- linked itinerary template (optional) -->
          <div v-if="linkedTemplate" class="card p-[16px_18px] flex items-center gap-4 flex-wrap">
            <span class="w-[42px] h-[42px] rounded-[12px] bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"><i class="i-lucide-map text-[20px]" /></span>
            <div class="flex-1 min-w-[180px]">
              <div class="text-[12px] text-muted font-600">Rute Kelana</div>
              <div class="font-display text-[18px] font-600 mt-[1px]">{{ linkedTemplate.name }}</div>
              <div class="text-[12.5px] text-muted mt-[1px] money">{{ linkedTemplate.days.length }} hari · siap pakai</div>
            </div>
            <CoreButton variant="primary" class="!px-[16px] !py-[10px] !text-[13.5px] shrink-0" :disabled="usingTemplate" @click="useTemplate">
              <i class="i-lucide-wand-sparkles text-[15px]" /> {{ usingTemplate ? 'Membuat…' : 'Buat trip serupa' }}
            </CoreButton>
          </div>
        </div>

        <!-- Rekomendasi Tempat -->
        <div v-else-if="tab === 'tempat'" class="flex flex-col gap-4 anim-rise-fast">
          <div class="flex gap-2 flex-wrap" role="group" aria-label="Filter jenis tempat">
            <button type="button" :aria-pressed="typeFilter === 'all'" class="rounded-pill px-[13px] py-[7px] text-[13px] font-600 border transition-colors" :class="typeFilter === 'all' ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'" @click="typeFilter = 'all'">Semua ({{ places.length }})</button>
            <button v-if="featuredCount" type="button" :aria-pressed="typeFilter === 'featured'" class="rounded-pill px-[13px] py-[7px] text-[13px] font-600 border transition-colors flex items-center gap-[6px]" :class="typeFilter === 'featured' ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'" @click="typeFilter = 'featured'"><i class="i-lucide-sparkles text-[14px]" aria-hidden="true" /> Direkomendasikan ({{ featuredCount }})</button>
            <button
              v-for="t in presentTypes"
              :key="t.id"
              type="button"
              :aria-pressed="typeFilter === t.id"
              class="rounded-pill px-[13px] py-[7px] text-[13px] font-600 border transition-colors flex items-center gap-[6px]"
              :class="typeFilter === t.id ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
              @click="typeFilter = t.id"
            ><i :class="t.icon" class="text-[14px]" aria-hidden="true" /> {{ t.label }} ({{ typeCount(t.id) }})</button>
          </div>
          <div v-if="shownPlaces.length" class="grid gap-[16px]" style="grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr))">
            <GuidePlaceCard v-for="p in shownPlaces" :key="p.id" :place="p" :slug="guide.slug" />
          </div>
          <div v-else class="card p-10 text-center text-muted text-[14px]">Belum ada tempat di kategori ini.</div>
        </div>

        <!-- Lokasi: a list of Google Maps links, not an embedded map -->
        <div v-else-if="tab === 'lokasi'" class="flex flex-col gap-3 anim-rise-fast">
          <p class="text-[14px] text-muted">Buka tiap tempat langsung di Google Maps.</p>
          <div class="card divide-y divide-sand-100">
            <a v-for="p in places" :key="p.id" :href="searchUrl({ name: p.name, placeId: p.gmapsPlaceId }, guide.name)" target="_blank" rel="noopener" class="flex items-center gap-3 p-[13px_16px] hover:bg-sand-100 transition-colors">
              <i class="i-lucide-map-pin text-[16px] text-teal-700 shrink-0" aria-hidden="true" />
              <div class="flex-1 min-w-0"><div class="text-[14px] font-600 truncate">{{ p.name }}</div><div v-if="p.area" class="text-[12px] text-muted truncate">{{ p.area }}</div></div>
              <i class="i-lucide-external-link text-[15px] text-muted shrink-0" aria-hidden="true" />
              <span class="sr-only">(buka di Google Maps, tab baru)</span>
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
          <div v-else class="card p-8 text-center text-muted text-[14px]">Belum ada tips untuk destinasi ini.</div>
        </div>
      </div>
    </template>
  </div>
</template>
