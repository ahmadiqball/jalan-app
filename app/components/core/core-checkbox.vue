<script setup lang="ts">
import { CheckboxRoot, CheckboxIndicator } from 'reka-ui'

defineProps<{ modelValue: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [boolean] }>()
</script>

<template>
  <CheckboxRoot
    :model-value="modelValue"
    class="w-[20px] h-[20px] rounded-[6px] border-2 flex items-center justify-center shrink-0 transition-colors outline-none data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
    :class="modelValue ? '' : 'bg-white border-sand-line3'"
    @update:model-value="emit('update:modelValue', $event === true)"
  >
    <CheckboxIndicator>
      <i class="i-lucide-check text-[13px] text-white" />
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
