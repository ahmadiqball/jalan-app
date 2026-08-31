<script setup lang="ts">
// Temporary Phase-1 verification page. Replaced by the real landing in Phase 5.
const trips = useTripsStore()
const { rp } = useMoney()

const live = computed(() => trips.liveTrip ?? trips.trips[0]!)
const derived = useDerived(() => live.value)
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-6 px-6 py-16">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-[10px] bg-teal-600 relative overflow-hidden">
        <span class="absolute left-[6px] top-[7px] w-[9px] h-[9px] rounded-full bg-sand-100" />
        <span class="absolute left-[-2px] bottom-[9px] w-[25px] h-[14px] rounded-t-[14px] bg-brand-green" />
        <span class="absolute left-[7px] bottom-0 w-[29px] h-[9px] rounded-t-[11px] bg-brand-orange" />
      </div>
      <h1 class="font-display text-[34px] font-600 text-ink">Jalan</h1>
    </div>

    <ClientOnly>
      <div class="card p-6 flex flex-col gap-3 min-w-[320px]">
        <span class="eyebrow">Trip sedang jalan</span>
        <div class="font-display text-[24px] font-600">{{ live.name }}</div>
        <div class="text-[14px] text-ink-2">{{ live.place }} · {{ live.dates }}</div>
        <div class="flex items-baseline gap-2 mt-2">
          <span class="eyebrow">Terpakai</span>
          <span class="money text-[22px] font-600" :style="{ color: derived.budget.value.statusFg }">
            {{ rp(derived.budget.value.spent) }}
          </span>
          <span class="text-[13px] text-muted">dari {{ rp(derived.budget.value.plan) }}</span>
        </div>
        <div class="text-[13px] text-muted">
          {{ derived.budget.value.statusCopy }} · barang
          {{ derived.packing.value.done }}/{{ derived.packing.value.total }}
        </div>
      </div>
      <template #fallback>
        <div class="card p-6 text-muted text-[14px]">memuat…</div>
      </template>
    </ClientOnly>

    <p class="text-[13px] text-muted">Phase 1 — domain, stores &amp; derived data wired.</p>
  </main>
</template>
