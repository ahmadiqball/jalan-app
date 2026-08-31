<script setup lang="ts">
const route = useRoute()
const trips = useTripsStore()

const TAB_COMPONENTS: Record<string, string> = {
  overview: 'OverviewTab',
  days: 'DaysTab',
  budget: 'BudgetTab',
  expenses: 'ExpensesTab',
  packing: 'PackingTab',
  outfit: 'OutfitTab',
  members: 'MembersTab',
}

const tripId = computed(() => route.params.id as string)
const tab = computed(() => route.params.tab as string)
const trip = computed(() => trips.byId(tripId.value))
const tabComp = computed(() => TAB_COMPONENTS[tab.value] || 'OverviewTab')

useHead(() => ({ title: (trip.value?.name ?? 'Trip') + ' · Jalan' }))
</script>

<template>
  <ClientOnly>
    <div v-if="trip" class="flex-1 flex flex-col anim-rise">
      <LayoutTripHeader :trip="trip" />
      <div class="max-w-[1400px] w-full mx-auto p-[24px_20px_60px] md:p-[24px_32px_60px]">
        <component :is="tabComp" :key="tab" :trip="trip" />
      </div>
      <OverlayActivitySheet :trip="trip" />
      <OverlayEditTrip :trip="trip" />
    </div>
    <div v-else class="flex-1 flex items-center justify-center p-16 text-muted">
      Trip tidak ditemukan.
      <NuxtLink to="/beranda" class="ml-2 text-teal-600 font-600">Kembali</NuxtLink>
    </div>

    <template #fallback>
      <div class="flex-1 flex items-center justify-center p-16 text-muted">Memuat trip…</div>
    </template>
  </ClientOnly>
</template>
