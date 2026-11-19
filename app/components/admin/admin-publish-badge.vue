<script setup lang="ts">
/** Draf / Tayang status for admin content. Icon + text, never colour alone. */
defineProps<{ published: boolean }>()
</script>

<template>
  <span
    class="inline-flex items-center gap-[5px] whitespace-nowrap rounded-pill px-[9px] py-[3px] text-[11.5px] font-700"
    :class="published ? 'bg-teal-100 text-teal-700' : 'bg-sand-100 text-ink-2'"
  >
    <i :class="published ? 'i-lucide-eye' : 'i-lucide-pencil-line'" class="text-[12px]" aria-hidden="true" />
    {{ published ? 'Tayang' : 'Draf' }}
  </span>
</template>
