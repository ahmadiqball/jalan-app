<script setup lang="ts">
const props = withDefaults(
  defineProps<{ size?: number; text?: boolean; textSize?: number; variant?: 'brand' | 'ink' | 'light'; weight?: number }>(),
  { size: 30, text: true, textSize: 21, variant: 'brand', weight: 600 },
)

// only the wordmark colour is theme-aware; the mark is the real brand tile
const textColor = computed(() => {
  switch (props.variant) {
    case 'ink':
      return '#10262B'
    case 'light':
      return '#ffffff'
    default:
      return '#10262B'
  }
})
</script>

<template>
  <div class="flex items-center gap-[10px] select-none">
    <img
      src="/img/img-logo-square.png"
      alt="Kelana"
      class="shrink-0 block"
      :style="{ width: size + 'px', height: size + 'px' }"
    >
    <div
      v-if="text"
      class="font-display"
      :style="{ fontSize: textSize + 'px', color: textColor, fontWeight: weight, letterSpacing: '-.02em' }"
    >
      Kelana
    </div>
  </div>
</template>
