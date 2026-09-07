<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 5 })
</script>

<template>
  <div class="card p-[14px_16px] flex flex-col gap-3">
    <CoreSkeleton v-for="i in count" :key="i" class="h-[44px] w-full" rounded="rounded-field" />
  </div>
</template>
