<script setup lang="ts">
const session = useSessionStore()
const ready = useState<boolean>('account-ready', () => false)
</script>

<template>
  <!-- session comes from localStorage, so this can only render on the client -->
  <ClientOnly>
    <div v-if="session.authed && !ready" class="fixed inset-0 z-[40] bg-paper/80 flex items-center justify-center" role="status" aria-live="polite">
      <div class="card p-[14px_18px] text-[13.5px] text-ink-2 flex items-center gap-2">
        <i class="i-lucide-loader-circle animate-spin text-teal-600 text-[17px]" /> {{ $t('app.accountLoading') }}
      </div>
    </div>
  </ClientOnly>
</template>
