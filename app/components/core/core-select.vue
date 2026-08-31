<script setup lang="ts">
import {
  SelectRoot, SelectTrigger, SelectValue, SelectIcon, SelectPortal,
  SelectContent, SelectViewport, SelectItem, SelectItemText, SelectItemIndicator,
} from 'reka-ui'

type Opt = { value: string; label: string }
const props = withDefaults(
  defineProps<{
    modelValue: string
    options: (string | Opt)[]
    placeholder?: string
    small?: boolean
  }>(),
  { placeholder: 'Pilih', small: false },
)
const emit = defineEmits<{ 'update:modelValue': [string] }>()

const opts = computed<Opt[]>(() =>
  props.options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o)),
)
</script>

<template>
  <SelectRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event as string)">
    <SelectTrigger
      class="inline-flex items-center justify-between gap-2 bg-white border border-sand-line2 rounded-[11px] text-ink outline-none data-[state=open]:border-teal-600"
      :class="small ? 'px-[11px] py-[8px] text-[13px]' : 'px-[13px] py-[11px] text-[14px] w-full'"
    >
      <SelectValue :placeholder="placeholder" />
      <SelectIcon><i class="i-lucide-chevron-down text-[15px] text-muted" /></SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="6"
        class="z-[80] min-w-[--reka-select-trigger-width] bg-white border border-sand-line2 rounded-field p-[6px] shadow-drop"
      >
        <SelectViewport>
          <SelectItem
            v-for="o in opts"
            :key="o.value"
            :value="o.value"
            class="flex items-center justify-between gap-3 px-[10px] py-[8px] rounded-[9px] text-[14px] text-ink cursor-pointer outline-none data-[highlighted]:bg-sand-100 data-[state=checked]:text-teal-700 data-[state=checked]:font-600"
          >
            <SelectItemText>{{ o.label }}</SelectItemText>
            <SelectItemIndicator><i class="i-lucide-check text-[14px] text-teal-600" /></SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
