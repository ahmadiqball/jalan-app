<script setup lang="ts">
import type { Activity } from '~/types/domain'
import { tone, iconFor } from '~/utils/categories'
import { durLabel, timeRange, rp } from '~/utils/format'

const props = defineProps<{ act: Activity; people: number; selected?: boolean }>()
const ui = useUiStore()

const t = computed(() => tone(props.act.cat))
const icon = computed(() => iconFor(props.act.cat))
const meta = computed(() =>
  props.act.cat +
  (props.act.dur ? ' · ' + durLabel(props.act.dur) : '') +
  (props.act.place ? ' · ' + props.act.place : ''),
)
</script>

<template>
  <button
    class="w-full text-left bg-white rounded-card p-[14px_16px] flex items-center gap-[14px] transition-all hover:shadow-card"
    :style="{ border: `1px solid ${selected ? '#0E6E76' : '#EDE9DA'}` }"
    @click="ui.selectActivity(act.id)"
  >
    <div class="w-[54px] shrink-0 text-right">
      <div class="money text-[13px] font-600">{{ act.time || '–' }}</div>
      <div class="money text-[11px] text-muted mt-[2px]">{{ act.dur ? timeRange(act.time, act.dur).split('–')[1] : '' }}</div>
    </div>
    <div class="w-[38px] h-[38px] shrink-0 rounded-[12px] flex items-center justify-center" :style="{ background: t[0], color: t[1] }">
      <i :class="icon" class="text-[18px]" />
    </div>
    <div class="flex-1 min-w-0">
      <div class="text-[15px] font-700 truncate">{{ act.title }}</div>
      <div class="text-[13px] text-muted truncate">{{ meta }}</div>
    </div>
    <div class="text-right shrink-0">
      <div class="money text-[14px] font-600" :class="act.cost ? '' : 'text-muted'">
        {{ act.cost ? rp(act.cost) : '–' }}
      </div>
      <div class="text-[12px] text-muted mt-[2px]">{{ act.cost ? people + ' orang' : 'tanpa biaya' }}</div>
    </div>
  </button>
</template>
