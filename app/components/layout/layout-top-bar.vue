<script setup lang="ts">
const ui = useUiStore()
const route = useRoute()
const localePath = useLocalePath()

const nav = [
  { key: 'home', to: '/beranda' },
  { key: 'guides', to: '/guides' },
  { key: 'templates', to: '/template' },
  { key: 'archive', to: '/arsip' },
]
const isActive = (to: string) => {
  const p = localePath(to)
  return route.path === p || route.path.startsWith(p + '/')
}

async function openNewTrip() {
  if (!isActive('/beranda')) await navigateTo(localePath('/beranda'))
  ui.showNewTrip = true
}
</script>

<template>
  <header
    class="h-[68px] shrink-0 bg-white border-b border-sand-line flex items-center gap-2 sm:gap-3 md:gap-[26px] px-3 sm:px-4 md:px-8 sticky top-0 z-40"
  >
    <NuxtLink :to="localePath('/beranda')" class="shrink-0 flex items-center">
      <CoreLogo :size="28" :text="false" class="sm:hidden" />
      <CoreLogo :size="30" class="hidden sm:block" />
    </NuxtLink>

    <nav class="hidden md:flex gap-1 text-[14px] font-600">
      <NuxtLink
        v-for="n in nav"
        :key="n.to"
        :to="localePath(n.to)"
        class="rounded-pill px-4 py-2 transition-colors"
        :class="isActive(n.to) ? 'bg-teal-100 text-teal-700' : 'text-ink-2 hover:bg-sand-100'"
      >
        {{ $t('nav.' + n.key) }}
      </NuxtLink>
    </nav>

    <div class="ml-auto flex items-center gap-2 sm:gap-3">
      <div
        class="hidden lg:flex items-center gap-2 w-[230px] bg-paper border border-sand-line2 rounded-pill px-4 py-[9px] text-[13.5px] text-muted"
      >
        <i class="i-lucide-search text-[15px]" />
        {{ $t('nav.search') }}
      </div>
      <!-- desktop-only controls; on mobile these live in the profile menu -->
      <div class="hidden md:flex items-center gap-3">
        <LayoutLangSwitch />
        <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[14px]" @click="openNewTrip">
          <i class="i-lucide-plus" />
          <span>{{ $t('nav.newTrip') }}</span>
        </CoreButton>
      </div>
      <LayoutUserMenu />
    </div>
  </header>
</template>
