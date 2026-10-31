<script setup lang="ts">
import {
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from 'reka-ui'

const session = useSessionStore()
const ui = useUiStore()
const route = useRoute()
const { signOut } = useAuth()
const { isAdmin } = useMe()
const showAdmin = computed(() => isAdmin.value)
const { sub } = useSubscription()
const planName = computed(() => (sub.value.plan ? PLANS[sub.value.plan].name : ''))

const localePath = useLocalePath()
const { locale } = useI18n()
const switchLocalePath = useSwitchLocalePath()

// mobile nav (on desktop these live in the top bar)
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
async function newTrip() {
  if (!isActive('/beranda')) await navigateTo(localePath('/beranda'))
  ui.showNewTrip = true
}
function setLocale(code: 'id' | 'en') {
  if (code !== locale.value) navigateTo(switchLocalePath(code))
}

async function logout() {
  await signOut()
  navigateTo(localePath('/masuk'))
}
</script>

<template>
  <DropdownMenuRoot>
    <DropdownMenuTrigger
      class="w-9 h-9 rounded-full bg-sand-100 hover:bg-sand-line flex items-center justify-center text-[13px] font-700 text-ink-2 transition-colors shrink-0 outline-none data-[state=open]:ring-2 data-[state=open]:ring-teal-600"
      :title="session.name"
    >
      {{ session.initials }}
    </DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        align="end"
        :side-offset="8"
        class="z-[80] min-w-[220px] bg-white border border-sand-line2 rounded-card shadow-drop p-[6px]"
      >
        <DropdownMenuLabel class="px-[10px] py-[8px]">
          <div class="text-[13.5px] font-700 text-ink truncate">{{ session.name }}</div>
          <div class="text-[12px] text-muted truncate">{{ session.email }}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator class="h-px bg-sand-line my-[5px]" />

        <!-- mobile-only: primary nav + new trip (lives in the top bar on desktop) -->
        <div class="md:hidden">
          <DropdownMenuItem
            class="flex items-center gap-2 px-[10px] py-[9px] rounded-[9px] text-[14px] font-700 text-white bg-primary cursor-pointer outline-none data-[highlighted]:bg-primary-hover mb-[2px]"
            @select="newTrip"
          >
            <i class="i-lucide-plus text-[16px]" /> {{ $t('nav.newTrip') }}
          </DropdownMenuItem>
          <DropdownMenuItem
            v-for="n in nav"
            :key="n.to"
            class="flex items-center justify-between px-[10px] py-[9px] rounded-[9px] text-[13.5px] cursor-pointer outline-none data-[highlighted]:bg-sand-100"
            :class="isActive(n.to) ? 'text-teal-700 font-700' : 'text-ink'"
            @select="navigateTo(localePath(n.to))"
          >
            {{ $t('nav.' + n.key) }}
            <i v-if="isActive(n.to)" class="i-lucide-check text-[15px] text-teal-600" />
          </DropdownMenuItem>
          <DropdownMenuSeparator class="h-px bg-sand-line my-[5px]" />
        </div>

        <DropdownMenuItem
          class="flex items-center gap-2 px-[10px] py-[9px] rounded-[9px] text-[13.5px] text-ink cursor-pointer outline-none data-[highlighted]:bg-sand-100"
          @select="navigateTo(localePath('/tersimpan'))"
        >
          <i class="i-lucide-bookmark text-[15px] text-teal-600" /> Tersimpan
        </DropdownMenuItem>
        <DropdownMenuItem
          class="flex items-center gap-2 px-[10px] py-[9px] rounded-[9px] text-[13.5px] text-ink cursor-pointer outline-none data-[highlighted]:bg-sand-100"
          @select="navigateTo(localePath('/langganan'))"
        >
          <i class="i-lucide-crown text-[15px] text-teal-600" /> {{ $t('menu.subscription') }}
          <span v-if="planName" class="ml-auto text-[11.5px] text-muted">{{ planName }}</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          v-if="showAdmin"
          class="flex items-center gap-2 px-[10px] py-[9px] rounded-[9px] text-[13.5px] text-ink cursor-pointer outline-none data-[highlighted]:bg-sand-100"
          @select="navigateTo(localePath('/admin'))"
        >
          <i class="i-lucide-shield text-[15px] text-teal-600" /> {{ $t('menu.admin') }}
        </DropdownMenuItem>
        <!-- mobile-only: language -->
        <div class="md:hidden px-[10px] py-[8px]">
          <div class="text-[11.5px] text-muted font-600 mb-[6px]">{{ $t('menu.language') }}</div>
          <div class="flex items-center gap-[3px] bg-sand-100 rounded-pill p-[3px]">
            <button
              class="flex-1 flex items-center justify-center gap-[6px] rounded-pill px-[9px] py-[7px] text-[12.5px] font-700 transition-colors"
              :class="locale === 'id' ? 'bg-white text-ink shadow-[0_1px_3px_rgba(16,38,43,.14)]' : 'text-muted'"
              @click="setLocale('id')"
            >
              <i class="i-circle-flags-id text-[16px]" /> ID
            </button>
            <button
              class="flex-1 flex items-center justify-center gap-[6px] rounded-pill px-[9px] py-[7px] text-[12.5px] font-700 transition-colors"
              :class="locale === 'en' ? 'bg-white text-ink shadow-[0_1px_3px_rgba(16,38,43,.14)]' : 'text-muted'"
              @click="setLocale('en')"
            >
              <i class="i-circle-flags-us text-[16px]" /> EN
            </button>
          </div>
        </div>
        <DropdownMenuSeparator class="md:hidden h-px bg-sand-line my-[5px]" />

        <DropdownMenuItem
          class="flex items-center gap-2 px-[10px] py-[9px] rounded-[9px] text-[13.5px] text-warn-fg cursor-pointer outline-none data-[highlighted]:bg-warn-bg"
          @select="logout"
        >
          <i class="i-lucide-log-out text-[15px]" /> {{ $t('menu.logout') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
