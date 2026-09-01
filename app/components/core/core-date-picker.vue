<script setup lang="ts">
import {
  DatePickerRoot, DatePickerField, DatePickerInput, DatePickerTrigger,
  DatePickerContent, DatePickerArrow, DatePickerCalendar,
  DatePickerHeader, DatePickerPrev, DatePickerHeading, DatePickerNext,
  DatePickerGrid, DatePickerGridHead, DatePickerGridRow, DatePickerHeadCell,
  DatePickerGridBody, DatePickerCell, DatePickerCellTrigger,
} from 'reka-ui'
import { CalendarDate, type DateValue } from '@internationalized/date'

const props = defineProps<{ modelValue: string; placeholder?: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

function toDateValue(iso: string): DateValue | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new CalendarDate(y, m, d)
}
function toIso(v: DateValue | undefined): string {
  if (!v) return ''
  return `${v.year}-${String(v.month).padStart(2, '0')}-${String(v.day).padStart(2, '0')}`
}

const value = computed<DateValue | undefined>({
  get: () => toDateValue(props.modelValue),
  set: (v) => emit('update:modelValue', toIso(v)),
})
</script>

<template>
  <DatePickerRoot v-model="value" locale="id-ID">
    <DatePickerField
      v-slot="{ segments }"
      class="flex items-center justify-between gap-2 bg-white border border-sand-line2 rounded-field px-[13px] py-[11px] text-[14px] font-mono text-ink data-[focused]:border-teal-600"
    >
      <div class="flex items-center">
        <template v-for="item in segments" :key="item.part">
          <DatePickerInput
            :part="item.part"
            class="rounded px-[2px] outline-none focus:bg-teal-100 focus:text-teal-700 data-[placeholder]:text-muted"
          >
            {{ item.value }}
          </DatePickerInput>
        </template>
      </div>
      <DatePickerTrigger class="text-muted hover:text-teal-600">
        <i class="i-lucide-calendar text-[16px]" />
      </DatePickerTrigger>
    </DatePickerField>

    <DatePickerContent :side-offset="6" class="z-[85] bg-white border border-sand-line2 rounded-card shadow-drop p-4">
      <DatePickerArrow class="fill-white" />
      <DatePickerCalendar v-slot="{ weekDays, grid }">
        <DatePickerHeader class="flex items-center justify-between mb-3">
          <DatePickerPrev class="w-[30px] h-[30px] rounded-full flex items-center justify-center hover:bg-sand-100"><i class="i-lucide-chevron-left text-[16px]" /></DatePickerPrev>
          <DatePickerHeading class="text-[14px] font-700" />
          <DatePickerNext class="w-[30px] h-[30px] rounded-full flex items-center justify-center hover:bg-sand-100"><i class="i-lucide-chevron-right text-[16px]" /></DatePickerNext>
        </DatePickerHeader>
        <DatePickerGrid v-for="month in grid" :key="month.value.toString()" class="w-full border-collapse select-none">
          <DatePickerGridHead>
            <DatePickerGridRow class="flex mb-1">
              <DatePickerHeadCell v-for="day in weekDays" :key="day" class="w-[34px] text-[11px] font-600 text-muted">{{ day }}</DatePickerHeadCell>
            </DatePickerGridRow>
          </DatePickerGridHead>
          <DatePickerGridBody>
            <DatePickerGridRow v-for="(weekDates, i) in month.rows" :key="`w-${i}`" class="flex">
              <DatePickerCell v-for="wd in weekDates" :key="wd.toString()" :date="wd">
                <DatePickerCellTrigger
                  :day="wd"
                  :month="month.value"
                  class="w-[34px] h-[34px] rounded-full flex items-center justify-center text-[13px] font-mono outline-none hover:bg-sand-100 data-[selected]:bg-teal-600 data-[selected]:text-white data-[today]:font-700 data-[outside-view]:text-muted/50 data-[disabled]:opacity-40"
                />
              </DatePickerCell>
            </DatePickerGridRow>
          </DatePickerGridBody>
        </DatePickerGrid>
      </DatePickerCalendar>
    </DatePickerContent>
  </DatePickerRoot>
</template>
