<script setup lang="ts">
/**
 * Brand logo. Renders the PNG lockup:
 *  - text (default): full mark + wordmark (img-logo-full)
 *  - text=false:     mark only (img-logo-mark, transparent)
 * `size` is the rendered height in px. `variant="light"` whitens it (for dark
 * backgrounds). textSize/textClass/weight kept for backward-compatible callers.
 */
withDefaults(
  defineProps<{ size?: number; text?: boolean; textSize?: number; textClass?: string; variant?: 'brand' | 'ink' | 'light'; weight?: number }>(),
  { size: 30, text: true, variant: 'brand' },
)
</script>

<template>
  <img
    :src="text ? '/img/img-logo-full.png' : '/img/img-logo-mark.png'"
    alt="Kelana"
    class="w-auto max-w-none select-none shrink-0"
    :class="textClass"
    :style="{ height: size + 'px', ...(variant === 'light' ? { filter: 'brightness(0) invert(1)' } : {}) }"
  >
</template>
