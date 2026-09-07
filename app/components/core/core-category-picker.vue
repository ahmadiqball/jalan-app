<script setup lang="ts">
import { MATS } from '~/utils/motifs'
import { COVERS, coverForMat } from '~/utils/categories'

/**
 * One "Kategori" control that sets the motif and its cover image as a set.
 * With `editableImage` (admin) an extra row lets you override the image
 * placeholder independently of the category.
 */
const props = withDefaults(
  defineProps<{ mat: string; cover: string; editableImage?: boolean }>(),
  { editableImage: false },
)
const emit = defineEmits<{ 'update:mat': [string]; 'update:cover': [string] }>()

const cats = Object.entries(MATS).map(([key, def]) => ({ key, label: def.label, bg: def.bg }))
const coverChoices = [['', 'Tanpa gambar'] as [string, string], ...COVERS]

function pickCat(key: string) {
  emit('update:mat', key)
  emit('update:cover', coverForMat(key)) // category picks the image too
}
</script>

<template>
  <div class="flex flex-col gap-3">
    <div>
      <span class="eyebrow">Kategori</span>
      <div class="flex flex-wrap gap-2 mt-2">
        <button
          v-for="c in cats"
          :key="c.key"
          type="button"
          class="rounded-pill px-[11px] py-[6px] text-[12px] font-600 border flex items-center gap-2 transition-colors"
          :class="mat === c.key ? 'border-teal-600 text-teal-700 bg-teal-100' : 'border-sand-line text-muted hover:border-teal-600'"
          @click="pickCat(c.key)"
        >
          <span class="w-[12px] h-[12px] rounded-full" :style="{ background: c.bg }" />
          {{ c.label }}
        </button>
      </div>
    </div>

    <div v-if="editableImage">
      <span class="eyebrow">Gambar</span>
      <div class="flex flex-wrap gap-2 mt-2">
        <button
          v-for="[url, label] in coverChoices"
          :key="url || 'none'"
          type="button"
          class="rounded-pill px-[11px] py-[6px] text-[12px] font-600 border transition-colors"
          :class="cover === url ? 'border-teal-600 text-teal-700 bg-teal-100' : 'border-sand-line text-muted hover:border-teal-600'"
          @click="emit('update:cover', url)"
        >
          {{ label }}
        </button>
      </div>
    </div>
  </div>
</template>
