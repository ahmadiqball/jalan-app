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

const panelStyle = computed(() =>
  props.side === 'right'
    ? { width: props.width + 'px', maxWidth: '96vw' }
    : { width: props.width + 'px', maxWidth: '94vw' },
)
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-[rgba(16,38,43,.34)] z-[60]" />

      <!-- right drawer: content IS the panel -->
      <DialogContent
        v-if="side === 'right'"
        class="anim-sheet fixed right-0 top-0 h-full bg-paper shadow-drawer flex flex-col z-[70] outline-none"
        :style="panelStyle"
      >
        <div class="flex items-center justify-between p-[20px_24px] border-b border-sand-line shrink-0">
          <DialogTitle class="font-display text-[21px] font-600">{{ title }}</DialogTitle>
          <DialogClose class="w-[32px] h-[32px] rounded-full bg-white border border-sand-line flex items-center justify-center text-ink-2 hover:border-teal-600">
            <i class="i-lucide-x text-[16px]" />
          </DialogClose>
        </div>
        <div class="flex-1 overflow-y-auto p-[20px_24px]"><slot /></div>
        <div v-if="$slots.footer" class="p-[16px_24px] border-t border-sand-line shrink-0"><slot name="footer" /></div>
      </DialogContent>

      <!-- center modal: content is a flex-centering layer, panel is inside -->
      <DialogContent
        v-else
        class="fixed inset-0 z-[70] flex items-start sm:items-center justify-center p-4 sm:p-6 overflow-y-auto outline-none"
      >
        <div class="anim-rise bg-paper rounded-hero shadow-lift flex flex-col max-h-[92vh] my-auto w-full" :style="panelStyle">
          <div class="flex items-center justify-between p-[20px_24px] border-b border-sand-line shrink-0">
            <DialogTitle class="font-display text-[21px] font-600">{{ title }}</DialogTitle>
            <DialogClose class="w-[32px] h-[32px] rounded-full bg-white border border-sand-line flex items-center justify-center text-ink-2 hover:border-teal-600">
              <i class="i-lucide-x text-[16px]" />
            </DialogClose>
          </div>
          <div class="flex-1 overflow-y-auto p-[20px_24px]"><slot /></div>
          <div v-if="$slots.footer" class="p-[16px_24px] border-t border-sand-line shrink-0"><slot name="footer" /></div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
