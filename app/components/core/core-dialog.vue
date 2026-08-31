<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui'

const props = withDefaults(
  defineProps<{
    open: boolean
    side?: 'right' | 'center'
    width?: number
    title?: string
  }>(),
  { side: 'right', width: 520 },
)
const emit = defineEmits<{ 'update:open': [boolean] }>()

const contentClass = computed(() =>
  props.side === 'right'
    ? 'anim-sheet fixed right-0 top-0 h-full bg-paper shadow-drawer flex flex-col'
    : 'anim-rise fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-paper rounded-hero shadow-lift flex flex-col max-h-[90vh]',
)
const contentStyle = computed(() =>
  props.side === 'right'
    ? { width: props.width + 'px', maxWidth: '96vw' }
    : { width: props.width + 'px', maxWidth: '94vw' },
)
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-[rgba(16,38,43,.34)] z-[60]" />
      <DialogContent :class="[contentClass, 'z-[70] outline-none']" :style="contentStyle">
        <div class="flex items-center justify-between p-[20px_24px] border-b border-sand-line shrink-0">
          <DialogTitle class="font-display text-[21px] font-600">{{ title }}</DialogTitle>
          <DialogClose class="w-[32px] h-[32px] rounded-full bg-white border border-sand-line flex items-center justify-center text-ink-2 hover:border-teal-600">
            <i class="i-lucide-x text-[16px]" />
          </DialogClose>
        </div>
        <div class="flex-1 overflow-y-auto p-[20px_24px]">
          <slot />
        </div>
        <div v-if="$slots.footer" class="p-[16px_24px] border-t border-sand-line shrink-0">
          <slot name="footer" />
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
