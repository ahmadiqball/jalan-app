<script setup lang="ts">
// Loading placeholder that mirrors the trip page (header + tab content).
</script>

<template>
  <div class="flex-1 flex flex-col">
    <div class="bg-white border-b border-sand-line">
      <div class="max-w-[1400px] mx-auto p-[18px_20px] md:p-[18px_32px] flex gap-[18px] items-start">
        <CoreSkeleton class="w-[78px] h-[78px] shrink-0" rounded="rounded-[20px]" />
        <div class="flex-1 min-w-0 flex flex-col gap-3 pt-1">
          <div class="flex gap-2">
            <CoreSkeleton class="h-6 w-24" rounded="rounded-pill" />
            <CoreSkeleton class="h-6 w-20" rounded="rounded-pill" />
          </div>
          <CoreSkeleton class="h-7 w-2/3 max-w-[320px]" />
          <CoreSkeleton class="h-4 w-1/2 max-w-[240px]" />
        </div>
      </div>
      <div class="max-w-[1400px] mx-auto p-[14px_20px_16px] md:p-[14px_32px_16px] flex gap-4 overflow-hidden">
        <CoreSkeleton v-for="i in 5" :key="i" class="h-5 w-16 shrink-0" />
      </div>
    </div>
    <div class="max-w-[1400px] w-full mx-auto p-[24px_20px] md:p-[24px_32px] flex flex-wrap gap-5">
      <div class="flex-1 min-w-0 flex flex-col gap-4">
        <CoreSkeleton class="h-[120px] w-full" rounded="rounded-card" />
        <CoreSkeleton class="h-[180px] w-full" rounded="rounded-card" />
      </div>
      <div class="w-full lg:w-[340px] lg:shrink-0 flex flex-col gap-4">
        <CoreSkeleton class="h-[140px] w-full" rounded="rounded-card" />
        <CoreSkeleton class="h-[100px] w-full" rounded="rounded-card" />
      </div>
    </div>
  </div>
</template>
