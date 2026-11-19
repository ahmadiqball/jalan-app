<script setup lang="ts">
const { t } = useI18n()
useHead({ title: () => t('nav.home') + ' · Kelana' })

const trips = useTripsStore()
const ui = useUiStore()
const session = useSessionStore()

const firstName = computed(() => session.name.trim().split(/\s+/)[0] || '')
const greeting = computed(() => (firstName.value ? t('app.home.hello', { name: firstName.value }) : t('app.home.helloAnon')))
const live = computed(() => trips.liveTrip)

const homeSub = computed(() => {
  const n = trips.userTrips.length
  if (!n) return t('app.home.subEmpty')
  if (!live.value) return t('app.home.subCount', { n }, n)
  return n > 1 ? t('app.home.subLive', { n: n - 1 }, n - 1) : t('app.home.subLiveOnly')
})

// The hero already shows the live trip, so the list never repeats it.
const showHero = computed(() => !!live.value && ui.homeFilter !== 'Rencana')
const cards = computed(() =>
  trips.userTrips.filter((tr) => {
    if (tr.status === 'live') return !showHero.value && ui.homeFilter !== 'Rencana'
    return ui.homeFilter !== 'Sedang jalan'
  }),
)
const showList = computed(() => ui.homeFilter !== 'Sedang jalan' || !showHero.value)
const listTitle = computed(() => (ui.homeFilter === 'Sedang jalan' ? t('app.home.liveTitle') : t('app.home.next')))
const listCount = computed(() => t('app.home.count', { n: cards.value.length }, cards.value.length))
const emptyCopy = computed(() => {
  if (!trips.userTrips.length) return ''
  if (ui.homeFilter === 'Sedang jalan') return t('app.home.emptyLive')
  if (ui.homeFilter === 'Rencana') return t('app.home.emptyPlan')
  return ''
})
</script>

<template>
  <div class="flex-1 w-full max-w-[1400px] mx-auto p-[30px_20px_60px] md:p-[30px_32px_60px] flex flex-col gap-[22px] anim-rise">
    <header class="flex justify-between items-end gap-4 flex-wrap">
      <div>
        <h1 class="font-display text-[28px] sm:text-[34px] font-600 leading-[1.15]">{{ greeting }}</h1>
        <ClientOnly>
          <p class="text-[15px] text-ink-2 mt-[5px]">{{ homeSub }}</p>
          <template #fallback><p class="h-[22px] mt-[5px]" /></template>
        </ClientOnly>
      </div>
      <DashboardFilterChips />
    </header>

    <ClientOnly>
      <section v-if="showHero && live" :aria-label="$t('app.home.liveTitle')">
        <DashboardHero :trip="live" />
      </section>

      <section v-if="showList" aria-labelledby="home-list-title" class="flex flex-col gap-[18px]">
        <div class="flex justify-between items-baseline mt-1">
          <h2 id="home-list-title" class="font-display text-[20px] font-600">{{ listTitle }}</h2>
          <span class="text-[13px] text-muted tabular-nums">{{ listCount }}</span>
        </div>

        <p v-if="emptyCopy" class="text-[14px] text-ink-2 bg-paper border border-sand-line rounded-card px-[18px] py-[14px]" role="status">
          {{ emptyCopy }}
        </p>

        <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
          <DashboardTripCard v-for="tr in cards" :key="tr.id" :trip="tr" />
          <button
            type="button"
            class="border border-dashed border-sand-line3 rounded-[22px] aspect-[3/2] p-6 flex flex-col items-center justify-center gap-[10px] text-ink-2 transition-colors hover:border-teal-600 hover:text-teal-700 hover:bg-white"
            @click="ui.showNewTrip = true"
          >
            <span class="w-[46px] h-[46px] rounded-full bg-teal-100 flex items-center justify-center text-teal-700" aria-hidden="true">
              <i class="i-lucide-plus text-[22px]" />
            </span>
            <span class="text-[15px] font-600">{{ $t('app.home.newTrip') }}</span>
            <span class="text-[13px] text-muted max-w-[220px] text-center leading-[1.5]">{{ $t('app.home.newTripHint') }}</span>
          </button>
        </div>
      </section>

      <DashboardTemplates />

      <template #fallback>
        <div class="flex flex-col gap-[18px]" role="status" :aria-label="$t('app.home.loading')">
          <div class="h-[300px] rounded-hero bg-sand-100 animate-pulse motion-reduce:animate-none" />
          <div class="h-[24px] w-[200px] rounded-pill bg-sand-100 animate-pulse motion-reduce:animate-none" />
          <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
            <div v-for="i in 3" :key="i" class="aspect-[3/2] rounded-[22px] bg-sand-100 animate-pulse motion-reduce:animate-none" />
          </div>
        </div>
      </template>
    </ClientOnly>

    <OverlayNewTrip />
  </div>
</template>
