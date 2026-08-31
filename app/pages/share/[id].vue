<script setup lang="ts">
definePageMeta({ layout: 'blank', public: true })
import { matDef } from '~/utils/motifs'

const route = useRoute()
const trips = useTripsStore()
const { flash } = useToast()

const trip = computed(() => trips.byId(route.params.id as string))
useHead(() => ({ title: (trip.value?.name ?? 'Trip') + ' · Jalan' }))

function copyLink() {
  try {
    navigator.clipboard?.writeText(window.location.href)
  } catch {
    /* ignore */
  }
  flash('Tautan disalin')
}
</script>

<template>
  <ClientOnly>
    <div v-if="trip" class="min-h-screen">
      <!-- cover band -->
      <div
        class="h-[236px] relative flex items-end"
        :style="{
          backgroundColor: matDef(trip.mat).bg,
          backgroundImage: trip.cover ? `linear-gradient(180deg, rgba(16,38,43,0) 30%, rgba(16,38,43,.55)), url('${trip.cover}')` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center 56%',
        }"
      >
        <div class="max-w-[880px] w-full mx-auto p-[0_24px_24px]">
          <div class="flex items-center gap-2 mb-2">
            <CoreLogo :size="26" :text-size="18" :class="trip.cover ? '[&_*]:!text-white' : ''" />
          </div>
          <div class="font-display text-[34px] font-600" :class="trip.cover ? 'text-white' : 'text-ink'">{{ trip.name }}</div>
          <div class="text-[14px] mt-1" :class="trip.cover ? 'text-white/85' : 'text-ink-2'">{{ trip.place }} · {{ trip.dates }}</div>
        </div>
      </div>

      <div class="max-w-[880px] mx-auto p-[28px_24px_60px] flex flex-col gap-6">
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="text-[14px] text-muted">Rencana perjalanan · {{ trip.days.length }} hari</div>
          <CoreButton variant="ghost" class="!px-[16px] !py-[9px] !text-[13.5px]" @click="copyLink">
            <i class="i-lucide-link text-[15px]" /> Salin tautan
          </CoreButton>
        </div>

        <div v-for="(d, i) in trip.days" :key="i" class="card p-[18px_20px]">
          <div class="flex items-baseline gap-3">
            <span class="font-display text-[18px] font-600">{{ d.long }}</span>
            <span v-if="d.title" class="text-[13px] text-muted">{{ d.title }}</span>
          </div>
          <div class="flex flex-col gap-[10px] mt-3">
            <div v-for="a in d.acts.slice().sort((x, y) => (x.time || '99').localeCompare(y.time || '99'))" :key="a.id" class="flex gap-3 items-start">
              <span class="money text-[13px] text-teal-700 w-[48px] shrink-0 pt-[1px]">{{ a.time || '–' }}</span>
              <div class="min-w-0">
                <div class="text-[14px] font-600">{{ a.title }}</div>
                <div v-if="a.place" class="text-[12.5px] text-muted">{{ a.place }}</div>
              </div>
            </div>
            <div v-if="!d.acts.length" class="text-[13px] text-muted">Belum ada aktivitas.</div>
          </div>
        </div>

        <div class="text-center text-[12.5px] text-muted pt-4">Dibuat dengan Jalan</div>
      </div>
    </div>
    <div v-else class="min-h-screen flex items-center justify-center text-muted">Trip tidak ditemukan.</div>
    <template #fallback><div class="min-h-screen flex items-center justify-center text-muted">Memuat…</div></template>
  </ClientOnly>
</template>
