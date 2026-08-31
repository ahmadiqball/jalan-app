<script setup lang="ts">
import type { Activity } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'

const emit = defineEmits<{ save: [Omit<Activity, 'id'>]; cancel: [] }>()

const time = ref('')
const title = ref('')
const cat = ref<string>('Transport')
const cost = ref('')
const dur = ref('60')

const cats = [...CATEGORIES, 'Santai']

function save() {
  if (!title.value.trim()) return
  emit('save', {
    time: time.value.trim(),
    title: title.value.trim(),
    cat: cat.value,
    place: '',
    cost: parseInt(cost.value.replace(/[^0-9]/g, '') || '0', 10),
    dur: parseInt(dur.value || '0', 10),
    note: '',
  })
}
</script>

<template>
  <div class="bg-white rounded-card p-[16px_17px] flex flex-col gap-[14px] anim-rise-fast" style="border:2px solid #0E6E76">
    <div class="grid gap-3" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
      <CoreInput v-model="time" label="Jam" placeholder="13.40" />
      <div class="col-span-full sm:col-span-1" style="grid-column:1/-1">
        <CoreInput v-model="title" label="Judul aktivitas" placeholder="mis. Sarapan di warung" />
      </div>
    </div>
    <div class="grid gap-3" style="grid-template-columns:repeat(auto-fit,minmax(140px,1fr))">
      <label class="flex flex-col gap-[7px]">
        <span class="text-[12.5px] font-600 text-ink-2">Kategori</span>
        <CoreSelect v-model="cat" :options="cats" />
      </label>
      <CoreInput v-model="cost" label="Biaya" mono placeholder="0" />
      <CoreInput v-model="dur" label="Durasi (menit)" mono placeholder="60" />
    </div>
    <div class="flex gap-[10px] justify-end">
      <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="emit('cancel')">Batal</CoreButton>
      <CoreButton variant="teal" class="!px-[18px] !py-[10px] !text-[13.5px]" @click="save">Simpan</CoreButton>
    </div>
  </div>
</template>
