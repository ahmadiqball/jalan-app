<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp } from '~/utils/format'
import { budgetSummary } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()

const activeCount = computed(() => props.trip.members.filter((m) => m.status === 'aktif').length)
const pendingCount = computed(() => props.trip.members.filter((m) => m.status === 'menunggu').length)
const perPerson = computed(() => budgetSummary(props.trip).perPerson)

const inviteEmail = ref('')
const inviteRole = ref('Bisa ubah')

function invite() {
  const email = inviteEmail.value.trim()
  if (!email || !email.includes('@')) return
  const name = email.split('@')[0]!.replace(/\W/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  trips.addMember(props.trip.id, { name, email, role: inviteRole.value as never, status: 'menunggu' })
  inviteEmail.value = ''
  flash('Undangan dikirim')
}
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <div class="flex-1 min-w-[520px] flex flex-col gap-4">
      <div>
        <div class="font-display text-[24px] font-600">Anggota trip</div>
        <div class="text-[13.5px] text-muted mt-[3px]">
          {{ activeCount }} aktif<span v-if="pendingCount"> · {{ pendingCount }} menunggu jawaban</span> ·
          biaya dibagi otomatis
        </div>
      </div>
      <div class="card p-[6px_18px]">
        <MembersRow v-for="m in trip.members" :key="m.id" :member="m" :trip-id="trip.id" />
      </div>
    </div>

    <div class="w-[340px] shrink-0 flex flex-col gap-4">
      <div class="card p-[18px]">
        <div class="font-display text-[17px] font-600">Undang orang</div>
        <div class="flex flex-col gap-3 mt-3">
          <CoreInput v-model="inviteEmail" type="email" label="Email" placeholder="email@contoh.com" @keydown.enter="invite" />
          <label class="flex flex-col gap-[7px]">
            <span class="text-[12.5px] font-600 text-ink-2">Peran</span>
            <CoreSelect v-model="inviteRole" :options="['Bisa ubah', 'Hanya lihat']" />
          </label>
          <CoreButton variant="primary" block @click="invite">Kirim undangan</CoreButton>
        </div>
      </div>
      <div class="card p-[18px] text-[13px] text-ink-2 leading-[1.5]">
        <div class="font-600 text-ink mb-1">Biaya per orang</div>
        Total terpakai dibagi rata ke {{ trip.people }} orang — sekarang <span class="money font-600">{{ rp(perPerson) }}</span> per orang.
        <span class="text-muted">Bisa ubah</span> boleh menambah aktivitas dan pengeluaran; <span class="text-muted">Hanya lihat</span> cuma membaca rencana.
      </div>
    </div>
  </div>
</template>
