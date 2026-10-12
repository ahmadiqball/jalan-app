<script setup lang="ts">
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem } from 'reka-ui'

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
  { key: 'members', icon: 'i-lucide-users' },
] as const

const current = computed(() => route.params.tab as string)
const currentTab = computed(() => tabs.find((x) => x.key === current.value) || tabs[0])

function go(key: string) {
  navigateTo(localePath(`/trip/${props.tripId}/${key}`))
}
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

  <!-- mobile: current-section button opens a portaled menu of all sections -->
  <div class="md:hidden px-4 pt-[10px] pb-[10px]">
    <DropdownMenuRoot>
      <DropdownMenuTrigger
        class="w-full flex items-center justify-between gap-2 bg-paper border border-sand-line2 rounded-field px-[14px] py-[11px] text-[15px] font-700 text-ink outline-none data-[state=open]:border-teal-600"
      >
        <span class="flex items-center gap-[10px] min-w-0">
          <i :class="currentTab.icon" class="text-[18px] text-teal-700 shrink-0" />
          <span class="truncate">{{ t('tabs.' + currentTab.key) }}</span>
        </span>
        <i class="i-lucide-chevron-down text-[18px] text-muted transition-transform data-[state=open]:rotate-180" />
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent
          align="start"
          :side-offset="6"
          class="z-[80] bg-white border border-sand-line2 rounded-card shadow-drop p-[6px] max-h-[62vh] overflow-y-auto"
          :style="{ width: 'var(--reka-dropdown-menu-trigger-width)' }"
        >
          <DropdownMenuItem
            v-for="tab in tabs"
            :key="tab.key"
            class="flex items-center gap-[12px] rounded-field px-[14px] py-[12px] text-[15px] cursor-pointer outline-none transition-colors data-[highlighted]:bg-sand-100"
            :class="current === tab.key ? 'bg-teal-100 text-teal-700 font-700' : 'text-ink-2 font-500'"
            @select="go(tab.key)"
          >
            <i :class="tab.icon" class="text-[18px] shrink-0" />
            <span class="flex-1">{{ t('tabs.' + tab.key) }}</span>
            <i v-if="current === tab.key" class="i-lucide-check text-[16px]" />
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </div>
</template>
