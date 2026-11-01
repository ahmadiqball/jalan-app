<script setup lang="ts">
const session = useSessionStore()
const ready = useState<boolean>('account-ready', () => false)
</script>

<template>
  <!-- session comes from localStorage, so this can only render on the client -->
  <ClientOnly>
    <div v-if="session.authed && !ready" class="fixed inset-0 z-[50] bg-paper flex flex-col items-center justify-center gap-5" role="status" :aria-label="$t('app.accountLoading')">
      <CoreLogo :size="38" :text-size="26" />
      <i class="i-lucide-loader-circle animate-spin text-teal-600 text-[22px]" />
    </div>
  </ClientOnly>
</template>
