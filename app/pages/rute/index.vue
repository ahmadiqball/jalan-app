<script setup lang="ts">
definePageMeta({ public: true })
const { t } = useI18n()
useHead({ title: () => t('nav.templates') + ' · Kelana' })

const { templates } = useTemplatesList()
</script>

<template>
  <div class="flex-1 w-full max-w-[1400px] mx-auto p-[30px_20px_60px] md:p-[30px_32px_60px] flex flex-col gap-5 anim-rise">
    <div>
      <h1 class="font-display text-[32px] font-600">{{ $t('app.templates.pageTitle') }}</h1>
      <p class="text-[15px] text-ink-2 mt-[5px] max-w-[62ch]">
        {{ $t('app.templates.pageSub') }}
      </p>
    </div>
    <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
      <RouteCard v-for="tp in templates" :key="tp.id" :route="tp" />
      <div v-if="!templates.length" class="text-muted text-[14px]">{{ $t('app.templates.empty') }}</div>
    </div>
  </div>
</template>
