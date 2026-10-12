<script setup lang="ts">
import type { Activity } from '~/types/domain'
import { tone, iconFor, catLabel } from '~/utils/categories'
import { durLabel, rp } from '~/utils/format'

const props = defineProps<{ act: Activity; tripId: string; people: number; selected?: boolean }>()
const ui = useUiStore()
const trips = useTripsStore()
const { flash } = useToast()
const { confirm } = useConfirm()
const { t } = useI18n()

const tn = computed(() => tone(props.act.cat))
const icon = computed(() => iconFor(props.act.cat))
const meta = computed(() =>
  catLabel(props.act.cat) +
  (props.act.dur ? ' · ' + durLabel(props.act.dur) : '') +
  (props.act.place ? ' · ' + props.act.place : ''),
)

async function del() {
  const ok = await confirm({
    title: t('confirm.delActTitle'),
    message: t('confirm.delActMsg', { title: props.act.title || props.act.cat }),
    confirmLabel: t('confirm.delActCta'),
    danger: true,
  })
  if (!ok) return
  trips.deleteActivity(props.tripId, props.act.id)
  if (ui.activityId === props.act.id) ui.selectActivity(null)
  flash('Aktivitas dihapus')
}
</script>

<template>
  <div
    class="relative group bg-white rounded-card transition-all hover:shadow-card"
    :style="{ border: `1px solid ${selected ? '#0E6E76' : '#EDE9DA'}` }"
  >
    <!-- stretched click layer: opens the detail sheet -->
    <button class="absolute inset-0 z-0 rounded-card" :aria-label="`Buka ${act.title || act.cat}`" @click="ui.selectActivity(act.id)" />

    <div class="relative z-[1] p-[12px_13px] md:p-[14px_16px] flex items-center gap-3 pointer-events-none">
      <div class="w-[36px] h-[36px] md:w-[38px] md:h-[38px] shrink-0 rounded-[11px] flex items-center justify-center" :style="{ background: tn[0], color: tn[1] }">
        <i :class="icon" class="text-[17px] md:text-[18px]" />
      </div>
      <div class="flex-1 min-w-0">
        <!-- time + title on one line so the title keeps the width -->
        <div class="flex items-baseline gap-2 min-w-0">
          <span class="money text-[12.5px] font-700 text-teal-700 shrink-0">{{ act.time || '–' }}</span>
          <span class="text-[14.5px] md:text-[15px] font-700 truncate">{{ act.title || 'Tanpa judul' }}</span>
        </div>
        <div class="text-[12.5px] md:text-[13px] text-muted truncate mt-[1px]">{{ meta }}</div>
      </div>
      <div class="text-right shrink-0">
        <div class="money text-[13.5px] md:text-[14px] font-600" :class="act.cost && act.paid ? 'text-ink' : 'text-muted'">
          {{ act.cost ? rp(act.cost) : '–' }}
        </div>
        <div v-if="act.cost" class="text-[10.5px] md:text-[11px] font-600 mt-[1px]" :class="act.paid ? 'text-teal-700' : 'text-muted'">
          {{ act.paid ? 'Dibayar' : 'Rencana' }}
        </div>
      </div>
      <!-- delete: revealed on hover / focus, always tappable on touch -->
      <button
        class="pointer-events-auto shrink-0 w-[30px] h-[30px] -mr-1 rounded-full flex items-center justify-center text-muted hover:text-warn-fg hover:bg-warn-bg opacity-100 md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100 transition-opacity"
        title="Hapus aktivitas"
        aria-label="Hapus aktivitas"
        @click="del"
      >
        <i class="i-lucide-trash-2 text-[15px]" />
      </button>
    </div>
  </div>
</template>
