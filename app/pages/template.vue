<script setup lang="ts">
useHead({ title: 'Template · Kelana' })
import type { Trip } from '~/types/domain'

const trips = useTripsStore()
const session = useSessionStore()
const { flash } = useToast()
const { rp } = useMoney()
const { templates } = useContent()
const cloud = useIsCloud()

const total = (tp: Trip) => {
  const b = tp.budgets?.find((x) => x.id === tp.activeBudget) || tp.budgets?.[0]
  return Object.values(b?.alloc || {}).reduce((n, v) => n + v, 0) || tp.plan || 0
}

function use(tp: Trip) {
  const id = trips.cloneTrip(tp, { owner: cloud ? { name: session.name, email: session.email } : undefined })
  flash('Template dipakai, tinggal atur tanggal')
  navigateTo(`/trip/${id}/days`)
}
</script>

<template>
  <div class="flex-1 w-full max-w-[1400px] mx-auto p-[30px_20px_60px] md:p-[30px_32px_60px] flex flex-col gap-5 anim-rise">
    <div>
      <div class="font-display text-[32px] font-600">Template kurasi</div>
      <div class="text-[15px] text-ink-2 mt-[5px]">
        Rencana lengkap dengan anggaran dan daftar barang. Ganti tanggal, langsung jalan.
      </div>
    </div>
    <ClientOnly>
      <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
        <div v-for="tp in templates" :key="tp.id" class="bg-white border border-sand-line rounded-[22px] overflow-hidden flex flex-col">
          <div class="h-[104px] bg-cover bg-center" :style="tp.cover ? { backgroundImage: `url('${tp.cover}')` } : {}">
            <CoreCover v-if="!tp.cover" :mat="tp.mat" :photo-size="0" />
          </div>
          <div class="p-[16px_18px_18px] flex flex-col gap-[11px] flex-1">
            <div>
              <div class="font-display text-[19px] font-600">{{ tp.name }}</div>
              <div class="text-[13px] text-muted mt-[3px]">{{ tp.place || 'Belum ada destinasi' }}</div>
            </div>
            <div class="flex gap-[7px] text-[12px] font-600 flex-wrap">
              <span class="bg-paper rounded-pill px-[11px] py-[6px] text-ink-2 money">{{ tp.days.length }} hari</span>
              <span class="bg-paper rounded-pill px-[11px] py-[6px] text-ink-2 money">{{ rp(total(tp)) }}</span>
            </div>
            <button class="mt-auto bg-teal-100 text-teal-700 rounded-pill py-[11px] text-[13.5px] font-700 hover:bg-teal-deep transition-colors" @click="use(tp)">
              Pakai template
            </button>
          </div>
        </div>
        <div v-if="!templates.length" class="text-muted text-[14px]">Belum ada template.</div>
      </div>
      <template #fallback><div class="card p-8 text-muted">Memuat…</div></template>
    </ClientOnly>
  </div>
</template>
