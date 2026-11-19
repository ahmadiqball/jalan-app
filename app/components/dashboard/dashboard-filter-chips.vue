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
  <div role="group" :aria-label="$t('app.filter.label')" class="flex gap-[9px] text-[13px] font-600 flex-wrap">
    <button
      v-for="f in filters"
      :key="f.v"
      type="button"
      :aria-pressed="ui.homeFilter === f.v"
      :class="ui.homeFilter === f.v ? 'chip-active' : 'chip-idle'"
      class="min-h-11"
      @click="ui.homeFilter = f.v"
    >
      {{ $t('app.filter.' + f.k) }}
    </button>
  </div>
</template>
