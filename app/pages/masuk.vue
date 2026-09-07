<script setup lang="ts">
definePageMeta({ layout: 'blank', public: true })
const { t } = useI18n()
useHead({ title: () => t('login.title') + ' · Kelana' })

const session = useSessionStore()
const route = useRoute()
const localePath = useLocalePath()
const { cloud, signIn, signInGoogle, guest } = useAuth()

const err = ref('')
const busy = ref(false)

// where to land after sign-in (locale prefix stripped so we can re-localize it)
const next = computed(() => {
  const n = String(route.query.next || '').replace(/^\/en(?=\/|$)/, '')
  return n.startsWith('/') ? n : '/beranda'
})

// forward onward the moment we're authed — covers the OAuth redirect, whose
// session hydrates asynchronously after this page has already mounted.
watch(
  () => session.authed,
  (v) => { if (v && import.meta.client) navigateTo(localePath(next.value)) },
  { immediate: true },
)

async function google() {
  if (busy.value) return
  busy.value = true
  const r = await signInGoogle()
  busy.value = false
  if (!r.ok) err.value = r.error || t('login.googleError')
}
async function localSignIn() {
  if (busy.value) return
  busy.value = true
  const r = await signIn('kamu@kelana.id', 'local')
  busy.value = false
  if (r.ok) navigateTo(localePath(next.value))
}
function signInGuest() {
  guest()
  navigateTo(localePath('/beranda'))
}
</script>

<template>
  <div class="min-h-screen flex flex-wrap">
    <!-- left panel -->
    <div class="flex-1 basis-[480px] min-h-[420px] relative overflow-hidden bg-teal-100 flex flex-col justify-between p-[44px_48px] gap-8">
      <div class="absolute rounded-full bg-sand-100" style="left:54px;top:56px;width:104px;height:104px" />
      <div class="absolute" style="left:-90px;bottom:-70px;width:520px;height:300px;border-radius:300px 300px 0 0;background:#C8E2DE" />
      <div class="absolute" style="right:-120px;bottom:-90px;width:460px;height:250px;border-radius:250px 250px 0 0;background:#8FC2BE" />
      <CoreMotif kind="plane" :size="60" color="#8FC2BE" :opacity="0.7" class="absolute" style="right:52px;top:44px;transform:rotate(24deg)" />
      <CoreMotif kind="balloon" :size="54" color="#8FC2BE" :opacity="0.55" class="absolute" style="left:150px;top:34px" />
      <CoreMotif kind="ship" :size="58" color="#8FC2BE" :opacity="0.6" class="absolute" style="right:96px;bottom:56px" />

      <div class="relative"><CoreLogo :size="34" :text-size="23" /></div>
      <div class="relative max-w-[420px] flex flex-col gap-4">
        <div class="font-display text-[40px] leading-[1.12] font-600 text-ink [text-wrap:pretty]">
          {{ $t('login.headline') }}
        </div>
        <div class="text-[15.5px] leading-[1.55] text-ink-2 max-w-[360px]">
          {{ $t('login.blurb') }}
        </div>
      </div>
      <div class="relative h-4" />
    </div>

    <!-- right: sign-in -->
    <div class="flex-1 basis-[420px] flex items-center justify-center p-[48px_32px] bg-paper">
      <div class="w-full max-w-[376px] flex flex-col gap-[22px] anim-rise">
        <div>
          <div class="font-display text-[30px] font-600">{{ $t('login.title') }}</div>
          <div class="text-[14.5px] text-ink-2 mt-[6px]">{{ $t('login.subtitle') }}</div>
        </div>

        <div v-if="err" class="bg-warn-bg text-warn-fg rounded-banner px-[14px] py-[10px] text-[13px] font-600">{{ err }}</div>

        <div class="flex flex-col gap-[11px]">
          <CoreButton v-if="cloud" variant="primary" block :disabled="busy" @click="google">
            <i class="i-lucide-chrome text-[16px]" /> {{ busy ? $t('login.busy') : $t('login.google') }}
          </CoreButton>
          <CoreButton v-else variant="primary" block :disabled="busy" @click="localSignIn">
            {{ busy ? $t('login.busy') : $t('login.local') }}
          </CoreButton>

          <div class="flex items-center gap-3 text-[12px] text-muted my-1">
            <span class="flex-1 h-px bg-sand-line" /> {{ $t('login.or') }} <span class="flex-1 h-px bg-sand-line" />
          </div>

          <CoreButton variant="ghost" block @click="signInGuest">{{ $t('login.guest') }}</CoreButton>
          <div class="text-[12px] text-muted text-center">{{ $t('login.guestNote') }}</div>
        </div>

        <div class="border-t border-sand-line pt-4 text-[13px] text-muted">
          {{ cloud ? $t('login.cloudNote') : $t('login.localNote') }}
        </div>
      </div>
    </div>
  </div>
</template>
