<script setup lang="ts">
import {
  DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuLabel,
} from 'reka-ui'

const session = useSessionStore()
const { signOut } = useAuth()
const { isAdmin } = useMe()
const showAdmin = computed(() => isAdmin.value && !session.guest)

const { locale, setLocale } = useI18n()
const switchLocalePath = useSwitchLocalePath()
const localePath = useLocalePath()
function switchTo(code: 'id' | 'en') {
  if (code !== locale.value) navigateTo(switchLocalePath(code))
}

async function logout() {
  const wasGuest = session.guest
  await signOut()
  // hard-reload after a guest trial so ephemeral in-memory data is cleared
  if (wasGuest && import.meta.client) window.location.href = localePath('/masuk')
  else navigateTo(localePath('/masuk'))
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
          <div class="text-[12px] text-muted truncate">{{ session.guest ? $t('menu.guest') : session.email }}</div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator class="h-px bg-sand-line my-[5px]" />

        <!-- language switcher -->
        <div class="px-[10px] py-[6px]">
          <div class="text-[11px] font-700 text-muted uppercase tracking-[.06em] mb-[6px]">{{ $t('menu.language') }}</div>
          <div class="flex gap-1">
            <button
              v-for="l in [['id', 'ID'], ['en', 'EN']] as const"
              :key="l[0]"
              class="flex-1 rounded-[8px] py-[6px] text-[12.5px] font-600 transition-colors"
              :class="locale === l[0] ? 'bg-teal-100 text-teal-700' : 'bg-sand-100 text-ink-2 hover:bg-sand-line'"
              @click="switchTo(l[0])"
            >
              {{ l[1] }}
            </button>
          </div>
        </div>
        <DropdownMenuSeparator class="h-px bg-sand-line my-[5px]" />

        <DropdownMenuItem
          v-if="showAdmin"
          class="flex items-center gap-2 px-[10px] py-[9px] rounded-[9px] text-[13.5px] text-ink cursor-pointer outline-none data-[highlighted]:bg-sand-100"
          @select="navigateTo(localePath('/admin'))"
        >
          <i class="i-lucide-shield text-[15px] text-teal-600" /> {{ $t('menu.admin') }}
        </DropdownMenuItem>
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
