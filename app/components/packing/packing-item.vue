<script setup lang="ts">
import type { PackItem } from '~/types/domain'

const props = defineProps<{ item: PackItem }>()
const emit = defineEmits<{ toggle: [] }>()
</script>

<template>
  <div
    class="flex items-center gap-3 rounded-field p-[11px_13px] cursor-pointer hover:bg-sand-100 transition-colors"
    @click="emit('toggle')"
  >
    <CoreCheckbox :model-value="item.done" @update:model-value="emit('toggle')" @click.stop />
    <span
      class="flex-1 text-[14px] min-w-0 truncate"
      :class="item.done ? 'line-through text-muted' : 'text-ink'"
    >
      {{ item.label }}
    </span>
    <span v-if="item.req" class="text-[11.5px] font-700 text-warn-fg shrink-0">Wajib</span>
    <a
      v-if="item.url"
      :href="item.url"
      target="_blank"
      rel="noopener"
      class="inline-flex items-center gap-1 rounded-pill bg-teal-100 text-teal-700 px-[9px] py-[4px] text-[11.5px] font-600 shrink-0"
      @click.stop
    >
      Beli <i class="i-lucide-external-link text-[12px]" />
    </a>
  </div>
</template>
