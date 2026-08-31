<script setup lang="ts">
import { matDef } from '~/utils/motifs'

const props = withDefaults(
  defineProps<{
    mat: string
    photo?: string
    /** panel height in px; if omitted the panel fills its container */
    height?: number
    /** circular photo diameter in px */
    photoSize?: number
    photoBorder?: number
    /** vertical offset of the photo (hero overlaps the bottom edge) */
    photoOffset?: number
  }>(),
  { photo: '', photoSize: 120, photoBorder: 6, photoOffset: 0 },
)
const m = computed(() => matDef(props.mat))
</script>

<template>
  <div
    class="relative overflow-hidden flex items-center justify-center"
    :style="{ background: m.bg, height: height ? height + 'px' : '100%' }"
  >
    <!-- sun -->
    <div
      class="absolute rounded-full"
      :style="{ left: '9%', top: '14%', width: '18%', maxWidth: '52px', aspectRatio: '1', background: m.sun }"
    />
    <!-- hills -->
    <div
      class="absolute"
      :style="{ left: '-14%', bottom: '-20%', width: '78%', height: '52%', borderRadius: '150px 150px 0 0', background: m.a }"
    />
    <div
      class="absolute"
      :style="{ right: '-18%', bottom: '-26%', width: '70%', height: '46%', borderRadius: '130px 130px 0 0', background: m.b }"
    />
    <!-- motif -->
    <CoreMotif :kind="m.motif" :size="56" :color="m.b" :opacity="0.55" class="absolute right-3 bottom-3" />

    <!-- photo / pin -->
    <div
      v-if="photo"
      class="relative z-[2] rounded-full bg-cover bg-center shrink-0"
      :style="{
        width: photoSize + 'px',
        height: photoSize + 'px',
        border: photoBorder + 'px solid #fff',
        boxShadow: '0 16px 34px -16px rgba(16,38,43,.45)',
        backgroundImage: `url('${photo}')`,
        backgroundPosition: 'center 60%',
        transform: photoOffset ? `translateY(${photoOffset}px)` : undefined,
      }"
    />
    <div
      v-else-if="photoSize > 0"
      class="relative z-[2] rounded-full bg-white/70 flex items-center justify-center text-teal-700"
      :style="{ width: photoSize + 'px', height: photoSize + 'px' }"
    >
      <i class="i-lucide-map-pin text-[28px]" />
    </div>

    <div class="absolute top-3 right-3 z-[3]">
      <slot name="badge" />
    </div>
  </div>
</template>
