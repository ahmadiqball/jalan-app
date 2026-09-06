<script setup lang="ts">
useHead({ title: 'Beranda · Jalan' })

const trips = useTripsStore()
const ui = useUiStore()
const session = useSessionStore()

const firstName = computed(() => session.name.trim().split(/\s+/)[0] || 'kamu')
const live = computed(() => trips.liveTrip)

const homeSub = computed(() =>
  live.value
    ? `Satu trip sedang jalan dan ${trips.trips.length - 1} rencana menunggu tanggal.`
    : `${trips.trips.length} trip tersimpan.`,
)

const cards = computed(() =>
  trips.trips.filter((t) => {
    if (ui.homeFilter === 'Sedang jalan') return t.status === 'live'
    if (ui.homeFilter === 'Rencana') return t.status !== 'live'
    return t.id !== live.value?.id
  }),
)
const listCount = computed(() => `${cards.value.length} trip`)
</script>

<template>
  <div class="flex-1 w-full max-w-[1400px] mx-auto p-[30px_20px_60px] md:p-[30px_32px_60px] flex flex-col gap-[22px] anim-rise">
    <div class="flex justify-between items-end gap-4 flex-wrap">
      <div>
        <div class="font-display text-[34px] font-600">Halo, {{ firstName }}</div>
        <div class="text-[15px] text-ink-2 mt-[5px]">{{ homeSub }}</div>
      </div>
      <DashboardFilterChips />
    </div>

    <ClientOnly>
      <DashboardHero v-if="live" :trip="live" />

      <div class="flex justify-between items-baseline mt-1">
        <div class="font-display text-[20px] font-600">Rencana berikutnya</div>
        <div class="text-[13px] text-muted">{{ listCount }}</div>
      </div>

      <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
        <DashboardTripCard v-for="t in cards" :key="t.id" :trip="t" />
        <button
          class="border border-dashed border-sand-line3 rounded-[24px] min-h-[260px] flex flex-col items-center justify-center gap-[10px] text-muted transition-colors hover:border-teal-600 hover:text-teal-700"
          @click="ui.showNewTrip = true"
        >
          <span class="w-[46px] h-[46px] rounded-full bg-teal-100 flex items-center justify-center text-[22px] text-teal-700">+</span>
          <span class="text-[14px] font-600">Trip baru</span>
          <span class="text-[12.5px] max-w-[200px] text-center leading-[1.5]">Mulai kosong atau ambil dari template kurasi</span>
        </button>
      </div>

      <DashboardTemplates />

      <template #fallback>
        <div class="card p-8 text-muted">Memuat trip…</div>
      </template>
    </ClientOnly>

    <OverlayNewTrip />
  </div>
</template>
