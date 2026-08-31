<script setup lang="ts">
defineEmits<{ add: [] }>()
</script>

<template>
  <div class="border border-dashed border-sand-line3 rounded-card p-9 flex flex-col items-center gap-3 text-center">
    <div class="w-[52px] h-[52px] rounded-full bg-teal-100 flex items-center justify-center text-teal-700">
      <i class="i-lucide-calendar-plus text-[24px]" />
    </div>
    <div class="text-[14px] text-ink-2 max-w-[280px]">Hari ini belum ada aktivitas. Tinggal isi harinya.</div>
    <CoreButton variant="teal" class="!bg-teal-100 !text-teal-700 !px-[18px] !py-[10px] !text-[13.5px] hover:!bg-teal-deep" @click="$emit('add')">
      Tambah aktivitas
    </CoreButton>
  </div>
</template>
