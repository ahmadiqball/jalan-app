<script setup lang="ts">
const localePath = useLocalePath()

const items = [
  { key: 'when', icon: 'i-lucide-calendar-days' },
  { key: 'places', icon: 'i-lucide-map-pin' },
  { key: 'tips', icon: 'i-lucide-lightbulb' },
  { key: 'plan', icon: 'i-lucide-route' },
]
</script>

<template>
  <section class="bg-white border border-sand-line rounded-hero p-[22px] md:p-[28px] flex flex-col gap-5">
    <div class="flex flex-wrap items-end justify-between gap-4">
      <div class="max-w-[620px]">
        <div class="font-display text-[26px] font-600">{{ $t('billing.guideInfo.title') }}</div>
        <p class="text-[14.5px] text-ink-2 leading-[1.6] mt-[6px]">{{ $t('billing.guideInfo.intro') }}</p>
      </div>
      <NuxtLink :to="localePath('/guides')"><CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]">{{ $t('billing.guideInfo.cta') }}</CoreButton></NuxtLink>
    </div>

    <div class="grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(min(230px,100%),1fr))">
      <div v-for="item in items" :key="item.key" class="flex gap-3 items-start">
        <span class="w-[36px] h-[36px] rounded-field bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"><i class="text-[18px]" :class="item.icon" /></span>
        <div class="min-w-0">
          <div class="text-[14px] font-700">{{ $t(`billing.guideInfo.${item.key}Title`) }}</div>
          <div class="text-[13px] text-ink-2 leading-[1.55] mt-[2px]">{{ $t(`billing.guideInfo.${item.key}`) }}</div>
        </div>
      </div>
    </div>

    <div class="border-t border-sand-100 pt-4 text-[13px] text-ink-2 leading-[1.6]">{{ $t('billing.guideInfo.access') }}</div>
  </section>
</template>
