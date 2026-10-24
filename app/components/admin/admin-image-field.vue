<script setup lang="ts">
/** Admin single-image field: big preview box + upload button + URL below. */
withDefaults(defineProps<{ modelValue?: string; label: string; hint?: string; boxClass?: string }>(), { modelValue: '' })
const emit = defineEmits<{ 'update:modelValue': [string] }>()
const { cloud, uploading, upload } = useImageUpload()
const input = ref<HTMLInputElement | null>(null)
async function onPick(e: Event) {
  const el = e.target as HTMLInputElement
  const url = await upload(el.files?.[0])
  if (url) emit('update:modelValue', url)
  el.value = ''
}
</script>

<template>
  <div class="flex flex-col gap-[6px]">
    <div class="text-[11.5px] text-muted font-600 flex items-center justify-between">
      <span>{{ label }}</span>
      <button v-if="cloud" type="button" class="text-teal-700 font-600 flex items-center gap-1 disabled:opacity-50" :disabled="uploading" @click="input?.click()"><i class="i-lucide-upload text-[12px]" /> {{ uploading ? 'Mengunggah…' : 'Unggah' }}</button>
    </div>

    <!-- big preview / upload box -->
    <div class="relative rounded-card border border-dashed border-sand-line2 bg-paper overflow-hidden" :class="boxClass || 'h-[176px]'">
      <img v-if="modelValue" :src="modelValue" alt="" class="w-full h-full object-contain">
      <button
        v-else type="button" class="w-full h-full flex flex-col items-center justify-center gap-2 text-muted hover:text-teal-700 hover:bg-sand-100 transition-colors disabled:opacity-60"
        :disabled="uploading || !cloud" @click="input?.click()"
      >
        <i class="i-lucide-image-plus text-[26px]" />
        <span class="text-[12px] font-600">{{ cloud ? 'Unggah gambar' : 'Tempel URL di bawah' }}</span>
      </button>
      <button
        v-if="modelValue && cloud" type="button"
        class="absolute top-2 right-2 rounded-pill bg-white/90 border border-sand-line2 px-[11px] py-[5px] text-[12px] font-600 text-ink-2 hover:text-teal-700 shadow-sm disabled:opacity-50"
        :disabled="uploading" @click="input?.click()"
      >{{ uploading ? 'Mengunggah…' : 'Ganti' }}</button>
    </div>

    <input
      :value="modelValue" class="field !py-[8px] !text-[12px] money" placeholder="https://… atau unggah di atas"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <div v-if="hint" class="text-[11px] text-muted leading-snug">{{ hint }}</div>

    <input ref="input" type="file" accept="image/*" class="hidden" @change="onPick">
  </div>
</template>
