<script setup lang="ts">
const ui = useUiStore()
// value stays the stable Indonesian key (used in filtering); label is localized
const filters = [
  { v: 'Semua', k: 'all' },
  { v: 'Sedang jalan', k: 'live' },
  { v: 'Rencana', k: 'plan' },
] as const
</script>

<template>
  <div class="flex gap-[9px] text-[13px] font-600 flex-wrap">
    <button
      v-for="f in filters"
      :key="f.v"
      :class="ui.homeFilter === f.v ? 'chip-active' : 'chip-idle'"
      @click="ui.homeFilter = f.v"
    >
      {{ $t('app.filter.' + f.k) }}
    </button>
  </div>
</template>
