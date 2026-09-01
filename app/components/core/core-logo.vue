<script setup lang="ts">
const props = withDefaults(
  defineProps<{ size?: number; text?: boolean; textSize?: number; variant?: 'brand' | 'ink' | 'light'; weight?: number }>(),
  { size: 30, text: true, textSize: 21, variant: 'brand', weight: 600 },
)
// shapes scale off the mark size (base 30)
const k = computed(() => props.size / 30)
const px = (n: number) => n * k.value + 'px'

const palette = computed(() => {
  switch (props.variant) {
    case 'ink':
      return { box: '#10262B', sun: '#DEEEEC', hill: '#C8E2DE', base: '#0E6E76', text: '#10262B' }
    case 'light':
      return { box: '#DEEEEC', sun: '#ffffff', hill: '#C8E2DE', base: '#0E6E76', text: '#ffffff' }
    default:
      return { box: '#0E6E76', sun: '#F1EEE1', hill: '#2F6B54', base: '#F0713A', text: '#10262B' }
  }
})
</script>

<template>
  <div class="flex items-center gap-[10px] select-none">
    <div
      class="relative overflow-hidden shrink-0"
      :style="{ width: px(30), height: px(30), borderRadius: px(9), background: palette.box }"
    >
      <div class="absolute rounded-full" :style="{ left: px(5), top: px(6), width: px(8), height: px(8), background: palette.sun }" />
      <div class="absolute" :style="{ left: px(-2), bottom: px(8), width: px(22), height: px(12), borderRadius: `${px(12)} ${px(12)} 0 0`, background: palette.hill }" />
      <div class="absolute" :style="{ left: px(6), bottom: '0', width: px(26), height: px(8), borderRadius: `${px(10)} ${px(10)} 0 0`, background: palette.base }" />
    </div>
    <div
      v-if="text"
      class="font-display"
      :style="{ fontSize: textSize + 'px', color: palette.text, fontWeight: weight, letterSpacing: '-.02em' }"
    >
      Jalan
    </div>
  </div>
</template>
