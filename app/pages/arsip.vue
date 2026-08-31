<script setup lang="ts">
useHead({ title: 'Arsip · Jalan' })
import { matDef } from '~/utils/motifs'
import { budgetSummary } from '~/utils/derive'

const trips = useTripsStore()
const { rp, shortRp } = useMoney()

const rows = computed(() =>
  trips.trips.map((t) => {
    const b = budgetSummary(t)
    return {
      id: t.id,
      name: t.name,
      dates: t.dates || 'belum diatur',
      matBg: matDef(t.mat).bg,
      planRp: rp(b.plan),
      spentRp: rp(b.spent),
      diff: (b.over ? 'lewat ' : 'sisa ') + shortRp(b.diff),
      diffFg: b.over ? '#C85A28' : '#2F6B54',
    }
  }),
)
</script>

<template>
  <div class="flex-1 w-full max-w-[1400px] mx-auto p-[30px_20px_60px] md:p-[30px_32px_60px] flex flex-col gap-[18px] anim-rise">
    <div>
      <div class="font-display text-[32px] font-600">Arsip</div>
      <div class="text-[15px] text-ink-2 mt-[5px]">
        Trip yang sudah selesai, dengan angka apa adanya untuk memperkirakan trip berikutnya.
      </div>
    </div>

    <ClientOnly>
      <div class="bg-white border border-sand-line rounded-[20px] overflow-x-auto">
        <div class="flex gap-4 p-[14px_20px] border-b border-sand-line min-w-[640px]">
          <span class="eyebrow flex-1 min-w-[180px]">Trip</span>
          <span class="eyebrow w-[120px]">Tanggal</span>
          <span class="eyebrow w-[120px] text-right">Rencana</span>
          <span class="eyebrow w-[120px] text-right">Terpakai</span>
          <span class="eyebrow w-[110px] text-right">Selisih</span>
        </div>
        <NuxtLink
          v-for="a in rows"
          :key="a.id"
          :to="`/trip/${a.id}/overview`"
          class="flex gap-4 items-center p-[15px_20px] border-b border-sand-100 last:border-0 min-w-[640px] hover:bg-sand-100 transition-colors"
        >
          <span class="flex-1 min-w-[180px] flex gap-3 items-center">
            <span class="w-[34px] h-[34px] rounded-[11px] shrink-0" :style="{ background: a.matBg }" />
            <span class="text-[15px] font-600">{{ a.name }}</span>
          </span>
          <span class="w-[120px] text-[13px] text-muted">{{ a.dates }}</span>
          <span class="w-[120px] text-right money text-[13.5px] text-ink-2">{{ a.planRp }}</span>
          <span class="w-[120px] text-right money text-[13.5px] font-600">{{ a.spentRp }}</span>
          <span class="w-[110px] text-right money text-[13px] font-600" :style="{ color: a.diffFg }">{{ a.diff }}</span>
        </NuxtLink>
      </div>
      <template #fallback><div class="card p-8 text-muted">Memuat…</div></template>
    </ClientOnly>
  </div>
</template>
