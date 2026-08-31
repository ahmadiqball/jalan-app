<script setup lang="ts">
const ui = useUiStore()
const filters = ['Semua', 'Sedang jalan', 'Rencana'] as const
</script>

<template>
  <div class="flex gap-[9px] text-[13px] font-600 flex-wrap">
    <button
      v-for="f in filters"
      :key="f"
      :class="ui.homeFilter === f ? 'chip-active' : 'chip-idle'"
      @click="ui.homeFilter = f"
    >
      {{ f }}
    </button>
  </div>
</template>
