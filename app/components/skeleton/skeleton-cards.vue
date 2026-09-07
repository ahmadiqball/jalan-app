<script setup lang="ts">
withDefaults(defineProps<{ count?: number }>(), { count: 6 })
</script>

<template>
  <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))">
    <div v-for="i in count" :key="i" class="bg-white border border-sand-line rounded-[20px] overflow-hidden">
      <CoreSkeleton class="h-[96px] w-full" rounded="rounded-none" />
      <div class="p-[16px] flex flex-col gap-[10px]">
        <CoreSkeleton class="h-5 w-2/3" />
        <CoreSkeleton class="h-4 w-1/2" />
        <CoreSkeleton class="h-9 w-full mt-1" rounded="rounded-pill" />
      </div>
    </div>
  </div>
</template>
