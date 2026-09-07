<script setup lang="ts">
/** A pulsing placeholder block. Size it via class, e.g. `class="h-5 w-40"`. */
withDefaults(defineProps<{ rounded?: string }>(), { rounded: 'rounded-[10px]' })
</script>

<template>
  <div class="animate-pulse bg-sand-line" :class="rounded" />
</template>
