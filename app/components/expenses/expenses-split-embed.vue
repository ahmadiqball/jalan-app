<script setup lang="ts">
import { DialogRoot, DialogPortal, DialogOverlay, DialogContent, DialogTitle, DialogClose } from 'reka-ui'

const props = defineProps<{ open: boolean; url: string }>()
const emit = defineEmits<{ 'update:open': [boolean] }>()
</script>

<template>
  <DialogRoot :open="open" @update:open="emit('update:open', $event)">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 bg-[rgba(16,38,43,.34)] z-[60]" />
      <DialogContent
        class="anim-sheet fixed right-0 top-0 h-full w-[480px] max-w-[96vw] bg-paper shadow-drawer flex flex-col z-[70] outline-none"
      >
        <div class="flex items-center justify-between p-[14px_18px] border-b border-sand-line shrink-0">
          <DialogTitle class="flex items-center gap-2 font-display text-[17px] font-600">
            <i class="i-lucide-split text-teal-600 text-[17px]" /> Bagi rata · PetePete
          </DialogTitle>
          <div class="flex items-center gap-1">
            <a :href="url" target="_blank" rel="noopener" class="w-[32px] h-[32px] rounded-full flex items-center justify-center text-ink-2 hover:bg-sand-100" title="Buka di tab baru">
              <i class="i-lucide-external-link text-[15px]" />
            </a>
            <DialogClose class="w-[32px] h-[32px] rounded-full flex items-center justify-center text-ink-2 hover:bg-sand-100" title="Tutup">
              <i class="i-lucide-x text-[16px]" />
            </DialogClose>
          </div>
        </div>
        <iframe
          v-if="open && url"
          :src="url"
          title="PetePete"
          class="flex-1 w-full border-0 bg-white"
          allow="clipboard-write"
        />
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
