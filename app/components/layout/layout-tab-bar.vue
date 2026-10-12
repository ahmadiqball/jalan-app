<script setup lang="ts">
const props = defineProps<{ tripId: string }>()
const route = useRoute()
const localePath = useLocalePath()
const { t } = useI18n()

/** section icons — used by the mobile menu and the current-section button */
const tabs = [
  { key: 'overview', icon: 'i-lucide-layout-dashboard' },
  { key: 'days', icon: 'i-lucide-calendar-days' },
  { key: 'budget', icon: 'i-lucide-wallet' },
  { key: 'expenses', icon: 'i-lucide-receipt' },
  { key: 'packing', icon: 'i-lucide-luggage' },
  { key: 'outfit', icon: 'i-lucide-shirt' },
  { key: 'recommend', icon: 'i-lucide-sparkles' },
  { key: 'members', icon: 'i-lucide-users' },
] as const

const current = computed(() => route.params.tab as string)
const currentTab = computed(() => tabs.find((x) => x.key === current.value) || tabs[0])

const open = ref(false)
watch(() => route.path, () => (open.value = false))
</script>

<template>
  <!-- desktop: full tab strip -->
  <div class="hidden md:flex max-w-[1400px] mx-auto p-[14px_32px_0] flex-nowrap gap-[2px] overflow-x-auto">
    <NuxtLink
      v-for="tab in tabs"
      :key="tab.key"
      :to="localePath(`/trip/${props.tripId}/${tab.key}`)"
      class="px-4 pt-[11px] pb-[13px] text-[14px] whitespace-nowrap border-b-[2.5px] transition-colors"
      :class="current === tab.key ? 'border-teal-600 text-ink font-700' : 'border-transparent text-muted font-500 hover:text-ink-2'"
    >
      {{ t('tabs.' + tab.key) }}
    </NuxtLink>
  </div>

  <!-- mobile: current-section button that opens a menu of all sections -->
  <div class="md:hidden px-4 pt-[10px] pb-[10px]">
    <div class="relative">
      <button
        class="w-full flex items-center justify-between gap-2 bg-paper border border-sand-line2 rounded-field px-[14px] py-[11px] text-[15px] font-700 text-ink"
        :aria-expanded="open"
        @click="open = !open"
      >
        <span class="flex items-center gap-[10px] min-w-0">
          <i :class="currentTab.icon" class="text-[18px] text-teal-700 shrink-0" />
          <span class="truncate">{{ t('tabs.' + currentTab.key) }}</span>
        </span>
        <i class="i-lucide-chevron-down text-[18px] text-muted transition-transform" :class="open && 'rotate-180'" />
      </button>

      <!-- click-away backdrop + menu anchored under the button -->
      <div v-if="open" class="fixed inset-0 z-[55]" @click="open = false" />
      <div v-if="open" class="absolute left-0 right-0 top-[calc(100%+6px)] z-[56] bg-white border border-sand-line2 rounded-card shadow-drop p-[6px] max-h-[62vh] overflow-y-auto">
        <NuxtLink
          v-for="tab in tabs"
          :key="tab.key"
          :to="localePath(`/trip/${props.tripId}/${tab.key}`)"
          class="flex items-center gap-[12px] rounded-field px-[14px] py-[12px] text-[15px] transition-colors"
          :class="current === tab.key ? 'bg-teal-100 text-teal-700 font-700' : 'text-ink-2 font-500 hover:bg-sand-100'"
          @click="open = false"
        >
          <i :class="tab.icon" class="text-[18px] shrink-0" />
          <span class="flex-1">{{ t('tabs.' + tab.key) }}</span>
          <i v-if="current === tab.key" class="i-lucide-check text-[16px]" />
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
