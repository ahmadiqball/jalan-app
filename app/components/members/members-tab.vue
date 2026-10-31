<script setup lang="ts">
import type { MemberRole, Trip } from '~/types/domain'
import { rp } from '~/utils/format'
import { budgetSummary } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()
const trips = useTripsStore()
const { flash } = useToast()
const { busy, ensureLink, joinUrl, waUrl } = useInvite()
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

const addOpen = ref(false)
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

// manual add
const manualEmail = ref('')
function addManual() {
  const email = manualEmail.value.trim()
  if (!email || !email.includes('@')) return
  const name = email.split('@')[0]!.replace(/\W/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  trips.addMember(props.trip.id, { name, email, role: inviteRole.value as MemberRole, status: 'menunggu' })
  manualEmail.value = ''
  addOpen.value = false
  flash('Ditambahkan ke anggota')
}

const { sub, canAddMember, promptUpgrade } = useSubscription()
function openInvite() {
  if (!canAddMember(props.trip)) return promptUpgrade(`Paketmu maksimal ${sub.value.maxMembers} anggota per trip`)
  addOpen.value = true
}

// make the link as soon as the popup opens
watch(addOpen, (o) => { if (o && !link.value) makeLink() })
</script>

<template>
  <div class="flex flex-wrap gap-5">
    <div class="flex-1 min-w-0 flex flex-col gap-4">
      <div class="flex items-start justify-between gap-3">
        <div>
          <div class="font-display text-[24px] font-600">Anggota trip</div>
          <div class="text-[13.5px] text-muted mt-[3px]">
            {{ activeCount }} aktif<span v-if="pendingCount"> · {{ pendingCount }} menunggu jawaban</span> ·
            biaya dibagi otomatis
          </div>
        </div>
        <CoreButton v-if="canInvite" variant="primary" class="!px-[16px] !py-[10px] !text-[13.5px] shrink-0" @click="openInvite">
          <i class="i-lucide-user-plus" /> <span class="hidden sm:inline">Undang</span>
        </CoreButton>
      </div>
      <div class="card p-[6px_18px]">
        <MembersRow v-for="m in trip.members" :key="m.id" :member="m" :trip-id="trip.id" :can-manage="canManage" />
      </div>
    </div>

    <div class="w-full lg:w-[340px] lg:shrink-0 flex flex-col gap-4">
      <div class="card p-[18px] text-[13px] text-ink-2 leading-[1.5]">
        <div class="font-600 text-ink mb-1">Biaya per orang</div>
        Total terpakai dibagi rata ke {{ trip.people }} orang — sekarang <span class="money font-600">{{ rp(perPerson) }}</span> per orang.
        <span class="text-muted">Bisa ubah</span> boleh menambah aktivitas dan pengeluaran; <span class="text-muted">Hanya lihat</span> cuma membaca rencana.
      </div>
    </div>

    <!-- invite / add member popup -->
    <CoreDialog v-if="canInvite" v-model:open="addOpen" side="center" :width="440" title="Undang anggota">
      <div class="flex flex-col gap-4">
        <label class="flex flex-col gap-[7px]">
          <span class="text-[12.5px] font-600 text-ink-2">Peran untuk yang gabung</span>
          <CoreSelect v-model="inviteRole" :options="['Bisa ubah', 'Hanya lihat']" />
        </label>

        <!-- invite link -->
          <div>
            <div class="text-[12.5px] font-600 text-ink-2 mb-[7px]">Link undangan</div>
            <CoreButton v-if="!link" variant="primary" block :disabled="busy" @click="makeLink">
              {{ busy ? 'Menyiapkan…' : 'Buat link undangan' }}
            </CoreButton>
            <div v-else class="flex flex-col gap-2">
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
              <div class="text-[11.5px] text-muted">Link memberi peran <span class="font-600">{{ inviteRole }}</span>.</div>
            </div>
          </div>

        <div class="border-t border-sand-line pt-4">
          <div class="text-[12.5px] font-600 text-ink-2 mb-[7px]">Atau tambah manual</div>
          <div class="flex flex-col gap-2">
            <CoreInput v-model="manualEmail" type="email" placeholder="email@contoh.com" @keydown.enter="addManual" />
            <CoreButton variant="ghost" block @click="addManual">Tambah anggota</CoreButton>
          </div>
        </div>
      </div>
    </CoreDialog>
  </div>
</template>
