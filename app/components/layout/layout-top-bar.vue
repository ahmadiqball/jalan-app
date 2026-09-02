<script setup lang="ts">
const session = useSessionStore()
const ui = useUiStore()
const route = useRoute()
const { signOut: authSignOut } = useAuth()

const nav = [
  { label: 'Beranda', to: '/beranda' },
  { label: 'Template', to: '/template' },
  { label: 'Arsip', to: '/arsip' },
]
const isActive = (to: string) => route.path === to || route.path.startsWith(to + '/')
const mobileOpen = ref(false)
watch(() => route.path, () => (mobileOpen.value = false))

async function signOut() {
  await authSignOut()
  navigateTo('/masuk')
}
async function openNewTrip() {
  if (route.path !== '/beranda') await navigateTo('/beranda')
  ui.showNewTrip = true
}
</script>

<template>
  <header
    class="h-[68px] shrink-0 bg-white border-b border-sand-line flex items-center gap-[26px] px-4 md:px-8 sticky top-0 z-40"
  >
    <button class="md:hidden w-9 h-9 rounded-[10px] hover:bg-sand-100 flex items-center justify-center shrink-0" @click="mobileOpen = !mobileOpen">
      <i :class="mobileOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="text-[20px] text-ink-2" />
    </button>

    <NuxtLink to="/beranda" class="shrink-0">
      <CoreLogo :size="30" :text-size="21" />
    </NuxtLink>

    <nav class="hidden md:flex gap-1 text-[14px] font-600">
      <NuxtLink
        v-for="n in nav"
        :key="n.to"
        :to="n.to"
        class="rounded-pill px-4 py-2 transition-colors"
        :class="isActive(n.to) ? 'bg-teal-100 text-teal-700' : 'text-ink-2 hover:bg-sand-100'"
      >
        {{ n.label }}
      </NuxtLink>
    </nav>

    <div class="ml-auto flex items-center gap-2 sm:gap-3">
      <div
        class="hidden lg:flex items-center gap-2 w-[230px] bg-paper border border-sand-line2 rounded-pill px-4 py-[9px] text-[13.5px] text-muted"
      >
        <i class="i-lucide-search text-[15px]" />
        Cari trip atau tempat
      </div>
      <CoreButton variant="primary" class="!px-[14px] sm:!px-[18px] !py-[10px] !text-[14px]" @click="openNewTrip">
        <i class="i-lucide-plus" />
        <span class="hidden sm:inline">Trip baru</span>
      </CoreButton>
      <button
        class="w-9 h-9 rounded-full bg-sand-100 hover:bg-sand-line flex items-center justify-center text-[13px] font-700 text-ink-2 transition-colors shrink-0"
        title="Keluar"
        @click="signOut"
      >
        {{ session.initials }}
      </button>
    </div>

    <!-- mobile menu -->
    <Transition
      enter-active-class="transition-opacity duration-150" enter-from-class="opacity-0"
      leave-active-class="transition-opacity duration-150" leave-to-class="opacity-0"
    >
      <div v-if="mobileOpen" class="md:hidden fixed inset-0 top-[68px] z-30 bg-[rgba(16,38,43,.34)]" @click="mobileOpen = false">
        <nav class="bg-white border-b border-sand-line p-3 flex flex-col gap-1" @click.stop>
          <NuxtLink
            v-for="n in nav"
            :key="n.to"
            :to="n.to"
            class="rounded-field px-4 py-3 text-[15px] font-600 transition-colors"
            :class="isActive(n.to) ? 'bg-teal-100 text-teal-700' : 'text-ink-2 hover:bg-sand-100'"
            @click="mobileOpen = false"
          >
            {{ n.label }}
          </NuxtLink>
        </nav>
      </div>
    </Transition>
  </header>
</template>
