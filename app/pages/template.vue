<script setup lang="ts">
useHead({ title: 'Template · Jalan' })
const trips = useTripsStore()
const { flash } = useToast()
const { rp } = useMoney()

const templates = [
  { name: 'Sumba 4 hari', sub: 'Waingapu, Wairinding, Tanggedu', mat: 'pantai', days: 4, plan: 3100000 },
  { name: 'Bromo–Ijen 5 hari', sub: 'Cemoro Lawang & Banyuwangi', mat: 'gunung', days: 5, plan: 4600000 },
  { name: 'Ubud hemat 3 hari', sub: 'Tegallalang & Ubud pusat', mat: 'sawah', days: 3, plan: 1850000 },
  { name: 'Bali Selatan 4 hari', sub: 'Seminyak, Uluwatu, Canggu', mat: 'kota', days: 4, plan: 2700000 },
  { name: 'Yogyakarta 3 hari', sub: 'Malioboro, Prambanan, Borobudur', mat: 'kuil', days: 3, plan: 2100000 },
  { name: 'Labuan Bajo 5 hari', sub: 'Komodo, Padar, Pink Beach', mat: 'pulau', days: 5, plan: 5400000 },
]

function use(tp: (typeof templates)[number]) {
  const id = trips.createTrip({ name: tp.name, place: tp.sub, mat: tp.mat, len: tp.days, plan: tp.plan })
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
    <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(300px,1fr))">
      <div v-for="tp in templates" :key="tp.name" class="bg-white border border-sand-line rounded-[22px] overflow-hidden flex flex-col">
        <div class="h-[104px]"><CoreCover :mat="tp.mat" :photo-size="0" /></div>
        <div class="p-[16px_18px_18px] flex flex-col gap-[11px] flex-1">
          <div>
            <div class="font-display text-[19px] font-600">{{ tp.name }}</div>
            <div class="text-[13px] text-muted mt-[3px]">{{ tp.sub }}</div>
          </div>
          <div class="flex gap-[7px] text-[12px] font-600">
            <span class="bg-paper rounded-pill px-[11px] py-[6px] text-ink-2 money">{{ tp.days }} hari</span>
            <span class="bg-paper rounded-pill px-[11px] py-[6px] text-ink-2 money">{{ rp(tp.plan) }}</span>
          </div>
          <button class="mt-auto bg-teal-100 text-teal-700 rounded-pill py-[11px] text-[13.5px] font-700 hover:bg-teal-deep transition-colors" @click="use(tp)">
            Pakai template
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
