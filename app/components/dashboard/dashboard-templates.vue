<script setup lang="ts">
const localePath = useLocalePath()
const { templates } = useTemplatesList()
const picks = computed(() => templates.value.slice(0, 3))
</script>

<template>
  <div v-if="picks.length" class="flex flex-col gap-4 mt-2">
    <div class="flex justify-between items-baseline">
      <div>
        <div class="font-display text-[20px] font-600">{{ $t('app.templates.startTitle') }}</div>
        <div class="text-[13.5px] text-muted mt-[2px]">{{ $t('app.templates.startSub') }}</div>
      </div>
      <NuxtLink :to="localePath('/rute')" class="text-[13px] font-600 text-teal-600 shrink-0">{{ $t('app.templates.seeAll') }}</NuxtLink>
    </div>
    <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(280px,100%),1fr))">
      <RouteCard v-for="tp in picks" :key="tp.id" :route="tp" compact />
    </div>
  </div>
</template>
