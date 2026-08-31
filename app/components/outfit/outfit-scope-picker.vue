<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { scopeOptions } from '~/utils/derive'

const props = defineProps<{ trip: Trip; modelValue: string }>()
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const options = computed(() =>
  scopeOptions(props.trip).map((o) => ({ value: o.value, label: (o.child ? '↳ ' : '') + o.label })),
)
</script>

<template>
  <CoreSelect
    :model-value="modelValue"
    :options="options"
    placeholder="Pilih hari atau aktivitas"
    @update:model-value="emit('update:modelValue', $event)"
  />
</template>
