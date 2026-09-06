<script setup lang="ts">
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem } from 'reka-ui'
import { ICON_CHOICES } from '~/utils/categories'

/** Colored square that shows a category's icon and, on click, lets you change it. */
const props = defineProps<{ icon: string; bg: string; fg: string; disabled?: boolean }>()
const emit = defineEmits<{ select: [string] }>()
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="w-[30px] h-[30px] rounded-[9px] flex items-center justify-center shrink-0 outline-none transition-shadow data-[state=open]:ring-2 data-[state=open]:ring-teal-600"
      :class="disabled ? 'cursor-default' : 'cursor-pointer hover:ring-2 hover:ring-sand-line2'"
      :style="{ background: props.bg, color: props.fg }"
      :disabled="disabled"
      :title="disabled ? '' : 'Ganti ikon'"
      @click.stop
    >
      <i :class="props.icon" class="text-[15px]" />
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        align="start"
        :side-offset="6"
        class="z-[80] bg-white border border-sand-line2 rounded-card shadow-drop p-[8px] grid grid-cols-4 gap-1"
      >
        <DropdownMenuItem
          v-for="ic in ICON_CHOICES"
          :key="ic"
          class="w-[38px] h-[38px] rounded-[9px] flex items-center justify-center cursor-pointer outline-none text-ink-2 data-[highlighted]:bg-sand-100"
          :class="ic === props.icon ? 'ring-2 ring-teal-600 text-teal-700' : ''"
          @select="emit('select', ic)"
        >
          <i :class="ic" class="text-[17px]" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
