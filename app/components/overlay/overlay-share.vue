<script setup lang="ts">
import type { MemberRole, Trip } from '~/types/domain'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const trips = useTripsStore()
const { flash } = useToast()
const { cloud, busy, ensureLink, joinUrl, waUrl } = useInvite()

const open = computed({ get: () => ui.shareOpen, set: (v: boolean) => (ui.shareOpen = v) })

const link = ref('')
const copied = ref(false)

// the role the link grants (owner-controlled, stored on the trip)
const inviteRole = computed<string>({
  get: () => props.trip.inviteRole || 'Bisa ubah',
  set: (v) => trips.setInviteRole(props.trip.id, v as MemberRole),
})

async function makeLink() {
  if (!cloud.value || link.value) return
  try {
    link.value = joinUrl(await ensureLink(props.trip.id))
  } catch {
    flash('Gagal membuat link. Coba lagi.')
  }
}
// provision the link as soon as the sheet opens
watch(open, (o) => { if (o) makeLink() }, { immediate: true })

const shareText = computed(() => `Yuk ikut rencana trip "${props.trip.name}" di Kelana`)
const waHref = computed(() => (link.value ? waUrl(link.value, props.trip.name) : '#'))
const tgHref = computed(() =>
  link.value ? `https://t.me/share/url?url=${encodeURIComponent(link.value)}&text=${encodeURIComponent(shareText.value)}` : '#',
)
const mailHref = computed(() =>
  link.value
    ? `mailto:?subject=${encodeURIComponent('Undangan trip: ' + props.trip.name)}&body=${encodeURIComponent(shareText.value + '\n\n' + link.value)}`
    : '#',
)
const canNativeShare = computed(() => import.meta.client && typeof navigator !== 'undefined' && !!navigator.share)

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
// Mobile: open the OS share sheet so the user can forward the invite to any
// app (WhatsApp, Instagram, Telegram…) as a normal message.
async function nativeShare() {
  if (!link.value || !canNativeShare.value) return
  try {
    await navigator.share({ title: props.trip.name, text: shareText.value, url: link.value })
  } catch {
    /* user dismissed the sheet — no-op */
  }
}
</script>

<template>
  <CoreDialog v-model:open="open" :width="440" title="Bagikan trip">
    <div class="flex flex-col gap-4">
      <p class="text-[13px] text-ink-2 -mt-1">
        Bagikan satu link undangan — siapa pun yang membukanya dan masuk langsung gabung ke trip ini.
      </p>

      <template v-if="cloud">
        <label class="flex flex-col gap-[7px]">
          <span class="text-[12.5px] font-600 text-ink-2">Peran untuk yang gabung</span>
          <CoreSelect v-model="inviteRole" :options="['Bisa ubah', 'Hanya lihat']" />
        </label>

        <!-- the link -->
        <div class="flex items-center gap-2 bg-paper border border-sand-line2 rounded-field px-[12px] py-[11px]">
          <i class="i-lucide-link text-[15px] text-teal-600 shrink-0" />
          <span v-if="link" class="text-[12.5px] text-ink-2 truncate flex-1">{{ link }}</span>
          <span v-else-if="busy" class="text-[12.5px] text-muted flex-1">Menyiapkan link…</span>
          <span v-else class="text-[12.5px] text-muted flex-1">—</span>
          <button
            class="shrink-0 text-[12.5px] font-600 flex items-center gap-1 px-1"
            :class="copied ? 'text-teal-600' : 'text-teal-700 hover:text-teal-600'"
            :disabled="!link"
            @click="copyLink"
          >
            <i class="text-[14px]" :class="copied ? 'i-lucide-check' : 'i-lucide-copy'" />
            {{ copied ? 'Tersalin' : 'Salin' }}
          </button>
        </div>

        <!-- native share (mobile): forward as a message to any app -->
        <CoreButton v-if="canNativeShare" variant="primary" block :disabled="!link" @click="nativeShare">
          <i class="i-lucide-share-2 text-[15px]" /> Bagikan…
        </CoreButton>

        <!-- explicit channels -->
        <div>
          <div class="text-[11.5px] font-600 text-muted mb-2">Atau kirim lewat</div>
          <div class="grid grid-cols-3 gap-2">
            <a :href="waHref" target="_blank" rel="noopener" :class="!link && 'pointer-events-none opacity-50'">
              <CoreButton variant="ghost" block class="!py-[10px] !text-[12.5px]"><i class="i-lucide-message-circle text-[15px] text-teal-700" /> WhatsApp</CoreButton>
            </a>
            <a :href="tgHref" target="_blank" rel="noopener" :class="!link && 'pointer-events-none opacity-50'">
              <CoreButton variant="ghost" block class="!py-[10px] !text-[12.5px]"><i class="i-lucide-send text-[15px] text-teal-700" /> Telegram</CoreButton>
            </a>
            <a :href="mailHref" :class="!link && 'pointer-events-none opacity-50'">
              <CoreButton variant="ghost" block class="!py-[10px] !text-[12.5px]"><i class="i-lucide-mail text-[15px] text-teal-700" /> Email</CoreButton>
            </a>
          </div>
        </div>

        <div class="text-[11.5px] text-muted">
          Link memberi peran <span class="font-600">{{ inviteRole }}</span>. Ganti di atas sebelum membagikan kalau perlu.
        </div>
      </template>

      <!-- local mode: no server, so no shareable link -->
      <div v-else class="bg-sand-100 rounded-field px-[13px] py-[12px] text-[12.5px] text-ink-2">
        Link undangan aktif saat kamu masuk dengan akun (mode cloud). Di mode lokal, tambahkan anggota manual dari tab Anggota.
      </div>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="open = false">Tutup</CoreButton>
      </div>
    </template>
  </CoreDialog>
</template>
