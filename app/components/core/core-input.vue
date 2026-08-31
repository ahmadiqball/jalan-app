<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: string | number
    type?: string
    placeholder?: string
    label?: string
    /** uppercase mono eyebrow label style (login form) vs plain label */
    eyebrow?: boolean
    mono?: boolean
    error?: boolean
  }>(),
  { type: 'text', eyebrow: false, mono: false, error: false },
)
const emit = defineEmits<{
  'update:modelValue': [string]
  keydown: [KeyboardEvent]
}>()

const inputCls = computed(() =>
  cn('field', props.mono && 'font-mono', props.error && 'border-warn-fg'),
)
</script>

<template>
  <label class="flex flex-col gap-[7px]">
    <span
      v-if="label"
      :class="
        eyebrow
          ? 'eyebrow'
          : 'text-[12.5px] font-600 text-ink-2'
      "
    >
      <slot name="label">{{ label }}</slot>
    </span>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :class="inputCls"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @keydown="emit('keydown', $event)"
    >
  </label>
</template>
