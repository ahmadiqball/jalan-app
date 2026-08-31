<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    /** 0..100 */
    pct: number
    /** explicit fill color; falls back to teal / warn based on `over` */
    color?: string
    over?: boolean
    height?: number
  }>(),
  { over: false, height: 8 },
)
const fill = computed(() => props.color || (props.over ? '#C85A28' : '#0E6E76'))
const width = computed(() => Math.max(0, Math.min(100, props.pct)) + '%')
</script>

<template>
  <div
    class="w-full rounded-pill bg-sand-100 overflow-hidden"
    :style="{ height: height + 'px' }"
  >
    <div
      class="h-full rounded-pill transition-all duration-300"
      :style="{ width, background: fill }"
    />
  </div>
</template>
