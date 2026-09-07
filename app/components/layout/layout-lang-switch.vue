<script setup lang="ts">
/** Segmented ID/EN language switch with flag icons. */
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
function go(code: 'id' | 'en') {
  if (code !== locale.value) navigateTo(switchLocalePath(code))
}
</script>

<template>
  <div class="flex items-center gap-[2px] bg-sand-100 rounded-pill p-[3px] shrink-0">
    <button
      class="flex items-center gap-[5px] rounded-pill px-[9px] py-[5px] text-[12px] font-700 transition-colors"
      :class="locale === 'id' ? 'bg-white text-ink shadow-[0_1px_3px_rgba(16,38,43,.14)]' : 'text-muted hover:text-ink-2'"
      title="Bahasa Indonesia"
      @click="go('id')"
    >
      <i class="i-circle-flags-id text-[16px]" /> <span class="hidden sm:inline">ID</span>
    </button>
    <button
      class="flex items-center gap-[5px] rounded-pill px-[9px] py-[5px] text-[12px] font-700 transition-colors"
      :class="locale === 'en' ? 'bg-white text-ink shadow-[0_1px_3px_rgba(16,38,43,.14)]' : 'text-muted hover:text-ink-2'"
      title="English"
      @click="go('en')"
    >
      <i class="i-circle-flags-us text-[16px]" /> <span class="hidden sm:inline">EN</span>
    </button>
  </div>
</template>
