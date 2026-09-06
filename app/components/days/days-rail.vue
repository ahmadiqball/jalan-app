<script setup lang="ts">
import type { Day } from '~/types/domain'
import { shortRp } from '~/utils/format'

const props = defineProps<{ days: Day[]; selected: number }>()
const emit = defineEmits<{ select: [number]; add: [] }>()

const total = (d: Day) => d.acts.reduce((n, a) => n + a.cost, 0)
// show the day's name, or a neutral "Hari N" when it has none (no forced name)
const dayName = (d: Day, i: number) => (d.title && d.title !== 'Belum diberi nama' ? d.title : 'Hari ' + (i + 1))
</script>

<template>
  <div class="w-full md:w-[212px] md:shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
    <button
      v-for="(d, i) in days"
      :key="i"
      class="text-left rounded-field p-[11px_13px] transition-colors shrink-0 md:shrink w-[150px] md:w-auto"
      :class="i === selected ? '' : 'bg-transparent hover:bg-sand-100'"
      :style="i === selected ? { background: '#DEEEEC' } : {}"
      @click="emit('select', i)"
    >
      <div class="flex justify-between items-center gap-1">
        <span class="money text-[12px]" :class="i === selected ? 'text-teal-700' : 'text-muted'">{{ d.date }}</span>
        <span v-if="total(d)" class="money text-[11px]" :class="i === selected ? 'text-teal-700' : 'text-muted'">{{ shortRp(total(d)) }}</span>
      </div>
      <div
        class="text-[14px] mt-[3px] truncate"
        :class="i === selected ? 'text-teal-700 font-700' : 'text-ink font-500'"
      >
        {{ dayName(d, i) }}
      </div>
    </button>
    <button
      class="text-left rounded-field p-[11px_13px] text-[13px] font-600 text-muted border border-dashed border-sand-line3 hover:border-teal-600 hover:text-teal-700 transition-colors shrink-0 whitespace-nowrap"
      @click="emit('add')"
    >
      + Tambah hari
    </button>
  </div>
</template>
