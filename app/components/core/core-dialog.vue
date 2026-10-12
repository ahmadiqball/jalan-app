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

// px width is applied only from `md`/`sm` up (see classes); mobile is a
// full-width bottom sheet. Exposed as a CSS var so breakpoint classes can use it.
const widthVar = computed(() => ({ '--dlg-w': props.width + 'px' }))
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-[rgba(16,38,43,.34)] z-[60]" />

      <!-- right drawer (desktop) / bottom sheet (mobile): content IS the panel -->
      <DialogContent
        v-if="side === 'right'"
        class="fixed z-[70] bg-paper flex flex-col outline-none
               inset-x-0 bottom-0 max-h-[90vh] rounded-t-hero anim-sheet-up shadow-[0_-16px_44px_-16px_rgba(16,38,43,.4)]
               md:inset-auto md:right-0 md:top-0 md:bottom-auto md:h-full md:max-h-none md:w-[var(--dlg-w)] md:max-w-[96vw] md:rounded-none md:anim-sheet md:shadow-drawer"
        :style="widthVar"
      >
        <div class="mx-auto mt-[8px] mb-[2px] h-1 w-10 rounded-full bg-sand-line2 md:hidden" />
        <div class="flex items-center justify-between p-[14px_18px] md:p-[20px_24px] border-b border-sand-line shrink-0">
          <DialogTitle class="font-display text-[19px] md:text-[21px] font-600">{{ title }}</DialogTitle>
          <DialogClose class="w-[32px] h-[32px] rounded-full bg-white border border-sand-line flex items-center justify-center text-ink-2 hover:border-teal-600">
            <i class="i-lucide-x text-[16px]" />
          </DialogClose>
        </div>
        <div class="flex-1 overflow-y-auto p-[16px_18px] md:p-[20px_24px]"><slot /></div>
        <div v-if="$slots.footer" class="p-[14px_18px] md:p-[16px_24px] border-t border-sand-line shrink-0"><slot name="footer" /></div>
      </DialogContent>

      <!-- center modal (desktop) / bottom sheet (mobile) -->
      <DialogContent
        v-else
        class="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-6 overflow-y-auto outline-none"
      >
        <div
          class="bg-paper flex flex-col w-full max-h-[90vh] sm:max-h-[92vh] sm:my-auto
                 rounded-t-hero sm:rounded-hero anim-sheet-up sm:anim-rise shadow-lift
                 sm:w-[var(--dlg-w)] sm:max-w-[94vw]"
          :style="widthVar"
        >
          <div class="mx-auto mt-[8px] mb-[2px] h-1 w-10 rounded-full bg-sand-line2 sm:hidden" />
          <div class="flex items-center justify-between p-[14px_18px] sm:p-[20px_24px] border-b border-sand-line shrink-0">
            <DialogTitle class="font-display text-[19px] sm:text-[21px] font-600">{{ title }}</DialogTitle>
            <DialogClose class="w-[32px] h-[32px] rounded-full bg-white border border-sand-line flex items-center justify-center text-ink-2 hover:border-teal-600">
              <i class="i-lucide-x text-[16px]" />
            </DialogClose>
          </div>
          <div class="flex-1 overflow-y-auto p-[16px_18px] sm:p-[20px_24px]"><slot /></div>
          <div v-if="$slots.footer" class="p-[14px_18px] sm:p-[16px_24px] border-t border-sand-line shrink-0"><slot name="footer" /></div>
        </div>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
