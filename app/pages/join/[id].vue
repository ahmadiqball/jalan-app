<script setup lang="ts">
definePageMeta({ layout: 'blank', public: true })
useHead({ title: 'Gabung trip · Jalan' })

const route = useRoute()
const session = useSessionStore()
const { apiFetch } = useApi()
const shareId = computed(() => String(route.params.id || ''))

const state = ref<'working' | 'error'>('working')
const message = ref('Menyiapkan undangan…')

onMounted(async () => {
  // guests can't join a shared trip — they must sign in first
  if (!session.authed || session.guest) {
    return navigateTo(`/masuk?next=${encodeURIComponent('/join/' + shareId.value)}`)
  }
  try {
    const { id } = await apiFetch<{ id: string }>(`/api/share/${shareId.value}/join`, { method: 'POST' })
    await navigateTo(`/trip/${id}`)
  } catch {
    state.value = 'error'
    message.value = 'Link undangan tidak berlaku atau sudah dicabut.'
  }
})
</script>

<template>
  <div class="min-h-screen flex items-center justify-center p-6 bg-paper">
    <div class="card p-[28px_30px] max-w-[380px] w-full text-center flex flex-col items-center gap-3">
      <CoreLogo :size="30" :text-size="20" />
      <template v-if="state === 'working'">
        <i class="i-lucide-loader-circle animate-spin text-[22px] text-teal-600 mt-2" />
        <div class="text-[14px] text-ink-2">{{ message }}</div>
      </template>
      <template v-else>
        <i class="i-lucide-link-2-off text-[24px] text-warn-fg mt-2" />
        <div class="text-[15px] font-600">Gagal gabung</div>
        <div class="text-[13.5px] text-muted">{{ message }}</div>
        <NuxtLink to="/beranda" class="mt-2"><CoreButton variant="ghost">Ke beranda</CoreButton></NuxtLink>
      </template>
    </div>
  </div>
</template>
