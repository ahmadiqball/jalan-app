<script setup lang="ts">
/**
 * Custom 24h time picker: two dropdowns (hour / minute) instead of the
 * browser-native <input type=time>, so it looks the same everywhere and stays
 * 24h. Stores/emits "HH.MM" (dot separator) to match the domain model; empty
 * string means "no time set" (hour = "--").
 */
const props = defineProps<{ modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const NONE = '--'
const hour = computed(() => (props.modelValue ? props.modelValue.split('.')[0]!.padStart(2, '0') : NONE))
const minute = computed(() => (props.modelValue ? (props.modelValue.split('.')[1] || '00').padStart(2, '0') : '00'))

const hourOptions = computed(() => [
  { value: NONE, label: '—' },
  ...Array.from({ length: 24 }, (_, i) => {
    const v = String(i).padStart(2, '0')
    return { value: v, label: v }
  }),
])
const minuteOptions = computed(() => {
  const steps = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'))
  if (!steps.includes(minute.value)) steps.push(minute.value)
  return steps.sort().map((v) => ({ value: v, label: v }))
})

function setHour(h: string) {
  emit('update:modelValue', h === NONE ? '' : h + '.' + minute.value)
}
function setMinute(m: string) {
  emit('update:modelValue', (hour.value === NONE ? '00' : hour.value) + '.' + m)
}
</script>

<template>
  <div class="flex items-center gap-2">
    <div class="flex-1"><CoreSelect :model-value="hour" :options="hourOptions" @update:model-value="setHour" /></div>
    <span class="text-muted font-600">:</span>
    <div class="flex-1"><CoreSelect :model-value="minute" :options="minuteOptions" @update:model-value="setMinute" /></div>
  </div>
</template>
