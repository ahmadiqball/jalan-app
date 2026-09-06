<script setup lang="ts">
const props = defineProps<{ tripId: string }>()
const route = useRoute()

const tabs = [
  ['overview', 'Ringkasan'],
  ['days', 'Hari'],
  ['budget', 'Anggaran'],
  ['expenses', 'Pengeluaran'],
  ['packing', 'Barang'],
  ['outfit', 'Outfit'],
  ['members', 'Anggota'],
] as const

const current = computed(() => route.params.tab as string)
</script>

<template>
  <div class="max-w-[1400px] mx-auto p-[14px_20px_0] md:p-[14px_32px_0] flex flex-nowrap gap-[2px] overflow-x-auto">
    <NuxtLink
      v-for="[key, label] in tabs"
      :key="key"
      :to="`/trip/${props.tripId}/${key}`"
      class="px-4 pt-[11px] pb-[13px] text-[14px] whitespace-nowrap border-b-[2.5px] transition-colors"
      :class="
        current === key
          ? 'border-teal-600 text-ink font-700'
          : 'border-transparent text-muted font-500 hover:text-ink-2'
      "
    >
      {{ label }}
    </NuxtLink>
  </div>
</template>
