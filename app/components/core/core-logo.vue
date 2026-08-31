<script setup lang="ts">
const props = withDefaults(
  defineProps<{ size?: number; text?: boolean; textSize?: number }>(),
  { size: 30, text: true, textSize: 21 },
)
// shapes scale off the mark size (base 30)
const k = computed(() => props.size / 30)
const px = (n: number) => n * k.value + 'px'
</script>

<template>
  <div class="flex items-center gap-[10px] select-none">
    <div
      class="relative overflow-hidden bg-teal-600 shrink-0"
      :style="{ width: px(30), height: px(30), borderRadius: px(9) }"
    >
      <div class="absolute rounded-full bg-sand-100" :style="{ left: px(5), top: px(6), width: px(8), height: px(8) }" />
      <div class="absolute bg-brand-green" :style="{ left: px(-2), bottom: px(8), width: px(22), height: px(12), borderRadius: `${px(12)} ${px(12)} 0 0` }" />
      <div class="absolute bg-brand-orange" :style="{ left: px(6), bottom: '0', width: px(26), height: px(8), borderRadius: `${px(10)} ${px(10)} 0 0` }" />
    </div>
    <div
      v-if="text"
      class="font-display font-600 text-ink"
      :style="{ fontSize: textSize + 'px' }"
    >
      Jalan
    </div>
  </div>
</template>
