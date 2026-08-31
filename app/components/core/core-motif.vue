<script setup lang="ts">
import { MOTIFS } from '~/utils/motifs'

const props = withDefaults(
  defineProps<{ kind: string; size?: number; color?: string; opacity?: number }>(),
  { size: 64, color: '#8FC2BE', opacity: 1 },
)
const parts = computed(() => MOTIFS[props.kind] || MOTIFS.compass!)
</script>

<template>
  <svg
    viewBox="0 0 100 100"
    :width="size"
    :height="size"
    :fill="color"
    :style="{ opacity, display: 'block' }"
    aria-hidden="true"
  >
    <path
      v-for="(p, i) in parts"
      :key="i"
      :d="p.d"
      :fill-opacity="p.o == null ? 1 : p.o"
      :transform="p.t"
    />
  </svg>
</template>
