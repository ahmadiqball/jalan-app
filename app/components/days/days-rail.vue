<script setup lang="ts">
import type { Day } from '~/types/domain'
import { shortRp } from '~/utils/format'
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from 'reka-ui'

const props = withDefaults(defineProps<{ days: Day[]; selected: number; stickyTop?: number }>(), { stickyTop: 0 })
const emit = defineEmits<{ select: [number]; add: [] }>()

const total = (d: Day) => d.acts.reduce((n, a) => n + a.cost, 0)
// show the day's name, or a neutral "Hari N" when it has none (no forced name)
const dayName = (d: Day, i: number) => (d.title && d.title !== 'Belum diberi nama' ? d.title : 'Hari ' + (i + 1))
const currentDay = computed(() => props.days[props.selected] || props.days[0])
</script>

<template>
  <!-- mobile: compact day dropdown -->
  <div class="w-full md:hidden">
    <DropdownMenuRoot>
      <DropdownMenuTrigger class="w-full flex items-center justify-between gap-2 bg-white border border-sand-line2 rounded-field px-[14px] py-[10px] outline-none data-[state=open]:border-teal-600">
        <span class="flex items-center gap-[10px] min-w-0 text-left">
          <i class="i-lucide-calendar-days text-[17px] text-teal-700 shrink-0" />
          <span class="min-w-0">
            <span class="block money text-[11.5px] text-muted leading-none">{{ currentDay?.date }}</span>
            <span class="block text-[14.5px] font-700 truncate leading-tight">{{ dayName(currentDay, selected) }}</span>
          </span>
        </span>
        <i class="i-lucide-chevron-down text-[18px] text-muted transition-transform data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="start"
          :side-offset="6"
          class="z-[80] bg-white border border-sand-line2 rounded-card shadow-drop p-[6px] max-h-[62vh] overflow-y-auto"
          :style="{ width: 'var(--reka-dropdown-menu-trigger-width)' }"
        >
          <DropdownMenuItem
            v-for="(d, i) in days"
            :key="i"
            class="flex items-center gap-2 rounded-field px-[14px] py-[11px] cursor-pointer outline-none transition-colors data-[highlighted]:bg-sand-100"
            :class="i === selected ? 'bg-teal-100' : ''"
            @select="emit('select', i)"
          >
            <span class="flex-1 min-w-0">
              <span class="block money text-[11px]" :class="i === selected ? 'text-teal-700' : 'text-muted'">{{ d.date }}</span>
              <span class="block text-[14px] truncate" :class="i === selected ? 'text-teal-700 font-700' : 'text-ink font-500'">{{ dayName(d, i) }}</span>
            </span>
            <span v-if="total(d)" class="money text-[11px] shrink-0" :class="i === selected ? 'text-teal-700' : 'text-muted'">{{ shortRp(total(d)) }}</span>
            <i v-if="i === selected" class="i-lucide-check text-[15px] text-teal-700 shrink-0" />
          </DropdownMenuItem>
          <DropdownMenuSeparator class="h-px bg-sand-line my-[5px]" />
          <DropdownMenuItem
            class="flex items-center gap-2 rounded-field px-[14px] py-[11px] text-[13.5px] font-600 text-teal-700 cursor-pointer outline-none data-[highlighted]:bg-sand-100"
            @select="emit('add')"
          >
            <i class="i-lucide-plus text-[16px]" /> Tambah hari
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>

  <!-- desktop: vertical rail -->
  <div
    class="hidden md:flex md:w-[212px] md:shrink-0 md:self-start md:sticky md:flex-col gap-2"
    :style="props.stickyTop ? { top: props.stickyTop + 'px' } : {}"
  >
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
      <div class="text-[14px] mt-[3px] truncate" :class="i === selected ? 'text-teal-700 font-700' : 'text-ink font-500'">
        {{ dayName(d, i) }}
      </div>
    </button>
    <button
      class="text-left rounded-field p-[11px_13px] text-[13px] font-600 text-muted border border-dashed border-sand-line3 hover:border-teal-600 hover:text-teal-700 transition-colors whitespace-nowrap"
      @click="emit('add')"
    >
      + Tambah hari
    </button>
  </div>
</template>
