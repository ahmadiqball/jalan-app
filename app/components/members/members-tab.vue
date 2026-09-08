<script setup lang="ts">
import type { MemberRole, Trip } from '~/types/domain'
import { rp } from '~/utils/format'
import { budgetSummary } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()
const { cloud, busy, ensureLink, joinUrl, waUrl } = useInvite()
const { isOwner, canEdit } = useTripAccess()

// only the owner may revoke access or change roles
const canManage = computed(() => isOwner(props.trip))
// viewers can't invite anyone
const canInvite = computed(() => canEdit(props.trip))

const activeCount = computed(() => props.trip.members.filter((m) => m.status === 'aktif').length)
const pendingCount = computed(() => props.trip.members.filter((m) => m.status === 'menunggu').length)
const perPerson = computed(() => budgetSummary(props.trip).perPerson)

// role the invite link grants (owner-controlled, stored on the trip)
const inviteRole = computed<string>({
  get: () => props.trip.inviteRole || 'Bisa ubah',
  set: (v) => trips.setInviteRole(props.trip.id, v as MemberRole),
})

const link = ref('')
const copied = ref(false)
async function makeLink() {
  try {
    const shareId = await ensureLink(props.trip.id)
    link.value = joinUrl(shareId)
  } catch {
    flash('Gagal membuat link. Coba lagi.')
  }
}
async function copyLink() {
  if (!link.value || !import.meta.client) return
  try {
    await navigator.clipboard.writeText(link.value)
    copied.value = true
    setTimeout(() => (copied.value = false), 1600)
  } catch {
    flash('Tidak bisa menyalin otomatis — salin manual ya.')
  }
}
const whatsapp = computed(() => (link.value ? waUrl(link.value, props.trip.name) : '#'))

// manual add (fallback / local mode) — same as before
const manualEmail = ref('')
function addManual() {
  const email = manualEmail.value.trim()
  if (!email || !email.includes('@')) return
  const name = email.split('@')[0]!.replace(/\W/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  trips.addMember(props.trip.id, { name, email, role: inviteRole.value as MemberRole, status: 'menunggu' })
  manualEmail.value = ''
  flash('Ditambahkan ke anggota')
}
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <div class="flex-1 min-w-0 flex flex-col gap-4">
      <div>
        <div class="font-display text-[24px] font-600">Anggota trip</div>
        <div class="text-[13.5px] text-muted mt-[3px]">
          {{ activeCount }} aktif<span v-if="pendingCount"> · {{ pendingCount }} menunggu jawaban</span> ·
          biaya dibagi otomatis
        </div>
      </div>
      <div class="card p-[6px_18px]">
        <MembersRow v-for="m in trip.members" :key="m.id" :member="m" :trip-id="trip.id" :can-manage="canManage" />
      </div>
    </div>

    <div class="w-full lg:w-[340px] lg:shrink-0 flex flex-col gap-4">
      <!-- invite link (primary) -->
      <div v-if="canInvite" class="card p-[18px]">
        <div class="font-display text-[17px] font-600">Undang lewat link</div>
        <div class="text-[12.5px] text-muted mt-[2px]">Bagikan satu link — siapa pun yang buka & masuk langsung gabung.</div>

        <label class="flex flex-col gap-[7px] mt-3">
          <span class="text-[12.5px] font-600 text-ink-2">Peran untuk yang gabung</span>
          <CoreSelect v-model="inviteRole" :options="['Bisa ubah', 'Hanya lihat']" />
        </label>

        <template v-if="cloud">
          <CoreButton v-if="!link" variant="primary" block class="mt-3" :disabled="busy" @click="makeLink">
            {{ busy ? 'Menyiapkan…' : 'Buat link undangan' }}
          </CoreButton>

          <div v-else class="mt-3 flex flex-col gap-2">
            <div class="flex items-center gap-2 bg-paper border border-sand-line2 rounded-field px-[12px] py-[10px]">
              <i class="i-lucide-link text-[15px] text-teal-600 shrink-0" />
              <span class="text-[12.5px] text-ink-2 truncate flex-1">{{ link }}</span>
            </div>
            <div class="flex gap-2">
              <CoreButton variant="ghost" class="flex-1 !py-[10px] !text-[13px]" @click="copyLink">
                <i class="text-[15px]" :class="copied ? 'i-lucide-check text-teal-600' : 'i-lucide-copy'" />
                {{ copied ? 'Tersalin' : 'Salin' }}
              </CoreButton>
              <a :href="whatsapp" target="_blank" rel="noopener" class="flex-1">
                <CoreButton variant="teal" block class="!py-[10px] !text-[13px]"><i class="i-lucide-send text-[15px]" /> WhatsApp</CoreButton>
              </a>
            </div>
            <div class="text-[11.5px] text-muted">Link memberi peran <span class="font-600">{{ inviteRole }}</span>. Ganti peran di atas kalau perlu.</div>
          </div>
        </template>
        <div v-else class="mt-3 bg-sand-100 rounded-field px-[13px] py-[11px] text-[12.5px] text-ink-2">
          Link undangan aktif saat kamu pakai akun (mode cloud). Di mode lokal, tambah anggota manual di bawah.
        </div>
      </div>

      <!-- manual add (fallback) -->
      <div v-if="canInvite" class="card p-[18px]">
        <div class="font-display text-[15px] font-600">Atau tambah manual</div>
        <div class="flex flex-col gap-3 mt-3">
          <CoreInput v-model="manualEmail" type="email" label="Email" placeholder="email@contoh.com" @keydown.enter="addManual" />
          <CoreButton variant="ghost" block @click="addManual">Tambah anggota</CoreButton>
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
