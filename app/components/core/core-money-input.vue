<script setup lang="ts">
import { digitsOnly, groupDigits } from '~/utils/format'

/**
 * Number-only money field. Accepts digits only; displays them auto-formatted
 * with id-ID thousand separators ("10000" shows as "10.000"). Emits the raw
 * numeric value. Styling is caller-controlled via `inputClass`.
 */
const props = withDefaults(
  defineProps<{
    modelValue: number
    placeholder?: string
    inputClass?: string
  }>(),
  { placeholder: '0', inputClass: 'field money' },
)
const emit = defineEmits<{ 'update:modelValue': [number]; keydown: [KeyboardEvent] }>()

const display = ref(props.modelValue ? groupDigits(props.modelValue) : '')

// keep display in sync when the value is changed elsewhere (not while typing here)
watch(
  () => props.modelValue,
  (v) => {
    if (digitsOnly(display.value) !== v) display.value = v ? groupDigits(v) : ''
  },
)

function onInput(e: Event) {
  const el = e.target as HTMLInputElement
  const formatted = groupDigits(el.value)
  display.value = formatted
  el.value = formatted // reflect the stripped/grouped value back into the field
  emit('update:modelValue', digitsOnly(formatted))
}
</script>

<template>
  <input
    :value="display"
    inputmode="numeric"
    :placeholder="placeholder"
    :class="inputClass"
    @input="onInput"
    @keydown="emit('keydown', $event)"
  >
</template>
