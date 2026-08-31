<script setup lang="ts">
import type { Day } from '~/types/domain'
import { shortRp } from '~/utils/format'

const props = defineProps<{ days: Day[]; selected: number }>()
const emit = defineEmits<{ select: [number]; add: [] }>()

const total = (d: Day) => d.acts.reduce((n, a) => n + a.cost, 0)
</script>

<template>
  <div class="w-[212px] shrink-0 flex flex-col gap-2">
    <button
      v-for="(d, i) in days"
      :key="i"
      class="text-left rounded-field p-[11px_13px] transition-colors"
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
        {{ d.title || 'Belum diberi nama' }}
      </div>
    </button>
    <button
      class="text-left rounded-field p-[11px_13px] text-[13px] font-600 text-muted border border-dashed border-sand-line3 hover:border-teal-600 hover:text-teal-700 transition-colors"
      @click="emit('add')"
    >
      + Tambah hari
    </button>
  </div>
</template>
