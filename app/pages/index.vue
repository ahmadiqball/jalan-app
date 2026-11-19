<script setup lang="ts">
import type { BillingPeriod } from '#shared/utils/plans'

definePageMeta({ layout: 'blank', public: true })
const { t } = useI18n()
useHead({ title: () => t('landing.metaTitle') })
const session = useSessionStore()
const localePath = useLocalePath()
const appHref = computed(() => localePath(session.authed ? '/beranda' : '/masuk'))
const { busy, start } = useCheckout()

// public guides for the guides feature (cards hidden when none published)
const { data: guidesData } = await useFetch('/api/guides', { key: 'landing-guides' })
const guides = computed(() => (guidesData.value || []).slice(0, 4))

const anchors = [
  { href: '#fitur', label: 'landing.nav.features' },
  { href: '#dalam', label: 'landing.nav.inside' },
  { href: '#cerita', label: 'landing.nav.stories' },
  { href: '#harga', label: 'landing.nav.pricing' },
]
const places = [
  { name: 'Sumba Timur', photo: '/img/photo-sumba.jpg', w: 1200, h: 798, tag: 'sumba', days: 4, people: 3, price: 'Rp 3,1jt' },
  { name: 'Ubud & Tegallalang', photo: '/img/photo-ubud.jpg', w: 1200, h: 900, tag: 'ubud', days: 3, people: 2, price: 'Rp 1,85jt' },
  { name: 'Bromo Sunrise', photo: '/img/photo-bromo.jpg', w: 1000, h: 521, tag: 'bromo', days: 5, people: 4, price: 'Rp 4,6jt' },
  { name: 'Bali Selatan', photo: '/img/photo-kota.jpg', w: 1200, h: 800, tag: 'bali', days: 4, people: 2, price: 'Rp 2,7jt' },
]
const rail = [
  { label: 'tabs.days', href: '#hari', desc: 'landing.rail.days', icon: 'i-lucide-calendar-days' },
  { label: 'tabs.budget', href: '#anggaran', desc: 'landing.rail.budget', icon: 'i-lucide-wallet' },
  { label: 'tabs.expenses', href: '#pengeluaran', desc: 'landing.rail.expenses', icon: 'i-lucide-receipt' },
  { label: 'tabs.packing', href: '#barang', desc: 'landing.rail.packing', icon: 'i-lucide-backpack' },
  { label: 'tabs.outfit', href: '#outfit', desc: 'landing.rail.outfit', icon: 'i-lucide-shirt' },
  { label: 'landing.rail.sharingLabel', href: '#anggota', desc: 'landing.rail.sharing', icon: 'i-lucide-users' },
  { label: 'landing.guides.label', href: '#panduan', desc: 'landing.guides.desc', icon: 'i-lucide-compass' },
]
const budgetCats = [
  { k: 'cat1', color: 'var(--teal-600)', v: '1,4jt' },
  { k: 'cat2', color: 'var(--brand-green)', v: '780rb' },
  { k: 'cat3', color: 'var(--brand-amber)', v: '450rb' },
  { k: 'cat4', color: 'var(--teal-soft-2)', v: '900rb' },
]
const expenseRows = [
  { k: 'row1', icon: 'i-lucide-car', v: '700rb' },
  { k: 'row2', icon: 'i-lucide-coffee', v: '48rb' },
  { k: 'row3', icon: 'i-lucide-square-parking', v: '20rb' },
]
const outfitRows = [
  { icon: 'i-lucide-shirt', k: 'top' },
  { icon: 'i-lucide-rectangle-vertical', k: 'bottom' },
  { icon: 'i-lucide-footprints', k: 'shoes' },
]
const members = [
  { ini: 'DP', name: 'Dimas Prayoga', k: 'm1' },
  { ini: 'AL', name: 'Ayu Larasati', k: 'm2' },
]
const stories = [
  { k: 's1', who: 'Dimas P.', ini: 'DP' },
  { k: 's2', who: 'Ayu L.', ini: 'AL' },
  { k: 's3', who: 'Sari H.', ini: 'SR' },
]

const period = ref<BillingPeriod>('1m')

// mobile menu
const menuOpen = ref(false)
function onKey(e: KeyboardEvent) { if (e.key === 'Escape') menuOpen.value = false }

// destination carousel: autoplay stops on hover, focus, off-screen, hidden tab,
// reduced motion, or as soon as the visitor takes control
const railEl = ref<HTMLElement | null>(null)
const slide = ref(0)
const playing = ref(true)
const hovering = ref(false)
const focused = ref(false)
const onScreen = ref(true)
const pageVisible = ref(true)
const reduceMotion = ref(false)
const autoplaying = computed(() => playing.value && !hovering.value && !focused.value && onScreen.value && pageVisible.value)
let timer: ReturnType<typeof setInterval> | undefined
let scrollT: ReturnType<typeof setTimeout> | undefined
let io: IntersectionObserver | undefined

function cardOffsets() {
  const track = railEl.value?.firstElementChild as HTMLElement | undefined
  if (!track) return []
  return Array.from(track.children).map(c => (c as HTMLElement).offsetLeft - track.offsetLeft)
}
function go(i: number) {
  slide.value = ((i % places.length) + places.length) % places.length
  const left = cardOffsets()[slide.value]
  if (railEl.value && left !== undefined) railEl.value.scrollTo({ left, behavior: reduceMotion.value ? 'auto' : 'smooth' })
}
function nav(i: number) { playing.value = false; go(i) }
// keep the counter and dots in sync when the rail is swiped or scrolled by hand
function onRailScroll() {
  clearTimeout(scrollT)
  scrollT = setTimeout(() => {
    const el = railEl.value
    if (!el) return
    const offs = cardOffsets()
    const max = el.scrollWidth - el.clientWidth
    // the last cards can't reach the left edge; keep the chosen slide there
    if (el.scrollLeft >= max - 2 && (offs[slide.value] ?? 0) >= max - 2) return
    let best = 0
    offs.forEach((o, i) => { if (Math.abs(o - el.scrollLeft) < Math.abs((offs[best] ?? 0) - el.scrollLeft)) best = i })
    slide.value = best
  }, 120)
}
function onFocusOut(e: FocusEvent) {
  const root = e.currentTarget as HTMLElement
  if (!root.contains(e.relatedTarget as Node | null)) focused.value = false
}
function onVisibility() { pageVisible.value = !document.hidden }

onMounted(() => {
  reduceMotion.value = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion.value) playing.value = false
  document.addEventListener('visibilitychange', onVisibility)
  window.addEventListener('keydown', onKey)
  if (railEl.value) {
    io = new IntersectionObserver(([entry]) => { onScreen.value = !!entry?.isIntersecting })
    io.observe(railEl.value)
  }
  timer = setInterval(() => { if (autoplaying.value) go(slide.value + 1) }, 5000)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  clearTimeout(scrollT)
  io?.disconnect()
  document.removeEventListener('visibilitychange', onVisibility)
  window.removeEventListener('keydown', onKey)
})
</script>

<template>
  <div class="min-h-screen overflow-x-clip">
    <!-- header -->
    <header class="sticky top-0 z-[60] bg-paper/95 backdrop-blur border-b border-sand-line">
      <div class="max-w-[1200px] mx-auto px-4 md:px-6 h-16 flex gap-3 md:gap-5 items-center">
        <CoreLogo :size="28" :text-size="19" variant="ink" :weight="800" class="shrink-0" />
        <nav :aria-label="$t('landing.nav.menu')" class="flex-1 hidden md:flex gap-6 items-center justify-center text-[14px] font-500">
          <a v-for="a in anchors" :key="a.href" :href="a.href" class="text-ink-2 hover:text-ink transition-colors">{{ $t(a.label) }}</a>
          <NuxtLink :to="localePath('/kurasi')" class="text-ink-2 hover:text-ink transition-colors">{{ $t('landing.nav.guides') }}</NuxtLink>
        </nav>
        <div class="ml-auto md:ml-0 flex gap-2 sm:gap-3 items-center shrink-0">
          <LayoutLangSwitch />
          <NuxtLink :to="appHref" class="text-[14px] font-600 text-ink hover:text-teal-700 px-1 hidden sm:block transition-colors">{{ $t('landing.nav.signin') }}</NuxtLink>
          <NuxtLink :to="appHref" class="bg-primary hover:bg-primary-hover text-white hover:text-white rounded-pill h-10 px-4 sm:px-5 inline-flex items-center text-[14px] font-600 whitespace-nowrap transition-colors">{{ $t('landing.nav.tryFree') }}</NuxtLink>
          <button
            type="button"
            class="md:hidden w-11 h-11 -mr-2 rounded-full flex items-center justify-center text-ink hover:bg-sand-100 transition-colors"
            :aria-label="$t('landing.nav.menu')"
            :aria-expanded="menuOpen"
            aria-controls="landing-menu"
            @click="menuOpen = !menuOpen"
          >
            <i :class="menuOpen ? 'i-lucide-x' : 'i-lucide-menu'" class="text-[20px]" aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav v-show="menuOpen" id="landing-menu" :aria-label="$t('landing.nav.menu')" class="md:hidden border-t border-sand-line bg-paper px-4 py-2">
        <ul class="flex flex-col">
          <li v-for="a in anchors" :key="a.href">
            <a :href="a.href" class="flex items-center h-12 text-[15px] font-500 text-ink hover:text-teal-700" @click="menuOpen = false">{{ $t(a.label) }}</a>
          </li>
          <li><NuxtLink :to="localePath('/kurasi')" class="flex items-center h-12 text-[15px] font-500 text-ink hover:text-teal-700" @click="menuOpen = false">{{ $t('landing.nav.guides') }}</NuxtLink></li>
          <li class="border-t border-sand-line mt-2 pt-2"><NuxtLink :to="appHref" class="flex items-center h-12 text-[15px] font-600 text-ink hover:text-teal-700">{{ $t('landing.nav.signin') }}</NuxtLink></li>
        </ul>
      </nav>
    </header>

    <main>
      <!-- hero -->
      <section class="relative overflow-hidden">
        <img src="/img/teal-cloud.svg" alt="" aria-hidden="true" class="absolute right-[-40px] top-5 w-[260px] opacity-90 pointer-events-none z-0">
        <img src="/img/teal-plane.svg" alt="" aria-hidden="true" class="absolute left-[-24px] top-[472px] w-[200px] opacity-75 pointer-events-none z-0 hidden md:block">

        <div class="relative z-[2] max-w-[1200px] mx-auto px-6 pt-14 pb-8 flex flex-wrap gap-10 items-center">
          <div class="flex-1 basis-[420px] min-w-[300px] max-w-[560px] anim-rise">
            <p class="flex gap-2 items-center text-[13px] font-600 text-teal-700">
              <span class="w-1.5 h-1.5 rounded-full bg-teal-600" aria-hidden="true" /> {{ $t('landing.hero.badge') }}
            </p>
            <h1 class="font-display text-[clamp(40px,5.2vw,64px)] font-600 tracking-[-.03em] leading-[1.02] mt-4 [text-wrap:balance]">
              {{ $t('landing.hero.title1') }}<br><span class="text-teal-700">{{ $t('landing.hero.title2') }}</span>
            </h1>
            <p class="text-[17px] leading-[1.6] text-ink-2 mt-5 max-w-[470px]">
              {{ $t('landing.hero.blurb') }}
            </p>
            <div class="flex gap-3 flex-wrap mt-8">
              <NuxtLink :to="appHref" class="bg-primary hover:bg-primary-hover text-white hover:text-white rounded-pill h-12 px-6 inline-flex items-center text-[15px] font-600 shadow-[0_18px_30px_-18px_rgba(16,38,43,.32)] transition-colors">{{ $t('landing.hero.tryFree') }}</NuxtLink>
              <a href="#dalam" class="bg-white border border-sand-line hover:border-sand-line3 text-ink hover:text-ink rounded-pill h-12 px-6 inline-flex items-center text-[15px] font-600 transition-colors">{{ $t('landing.hero.seeInside') }}</a>
            </div>
            <dl class="flex gap-5 flex-wrap mt-8">
              <div class="flex flex-col-reverse"><dt class="text-[13px] text-ink-2 mt-1">{{ $t('landing.hero.stat1') }}</dt><dd class="text-[20px] font-600 tabular-nums">12.400</dd></div>
              <div class="w-px bg-sand-line" aria-hidden="true" />
              <div class="flex flex-col-reverse"><dt class="text-[13px] text-ink-2 mt-1">{{ $t('landing.hero.stat2') }}</dt><dd class="text-[20px] font-600 tabular-nums">Rp 0</dd></div>
              <div class="w-px bg-sand-line" aria-hidden="true" />
              <div class="flex flex-col-reverse"><dt class="text-[13px] text-ink-2 mt-1">{{ $t('landing.hero.stat3') }}</dt><dd class="text-[20px] font-600 tabular-nums">4,9</dd></div>
            </dl>
          </div>

          <!-- hero collage -->
          <div class="flex-1 basis-[440px] min-w-[300px] relative h-[520px] hidden sm:block">
            <div class="absolute right-[2%] top-0 w-[63%] h-[74%] rounded-[24px] overflow-hidden rotate-[-2.5deg] shadow-[0_40px_70px_-34px_rgba(16,38,43,.55)] bg-sand-100">
              <img src="/img/photo-sumba.jpg" alt="" width="1200" height="798" fetchpriority="high" class="absolute inset-0 w-full h-full object-cover object-[center_56%]">
              <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(16,38,43,0) 50%,rgba(16,38,43,.7) 100%)" />
              <div class="absolute left-4 top-4 bg-paper/95 rounded-[12px] px-3 py-2">
                <div class="text-[12px] font-600 text-teal-700">{{ $t('landing.hero.collageDay') }}</div>
                <div class="text-[14px] font-600 mt-0.5">{{ $t('landing.hero.collageAct') }}</div>
              </div>
            </div>
            <div class="absolute left-0 bottom-3 w-[56%] bg-white border border-sand-line rounded-[20px] p-2 rotate-[2deg] shadow-[0_34px_60px_-34px_rgba(16,38,43,.5)]">
              <img src="/img/screen-hari.png" :alt="$t('landing.inside.cap2')" width="1254" height="823" class="w-full h-auto block rounded-[12px] bg-sand-100">
            </div>
            <div class="absolute right-0 bottom-11 w-[27%] aspect-square rounded-[16px] overflow-hidden rotate-[6deg] shadow-[0_26px_44px_-26px_rgba(16,38,43,.5)] bg-sand-100">
              <img src="/img/photo-bromo.jpg" alt="" width="1000" height="521" class="w-full h-full object-cover">
            </div>
            <div class="absolute left-[14%] top-2 bg-ink text-teal-100 rounded-pill px-4 py-2 text-[13px] font-600 tabular-nums rotate-[-3deg] shadow-[0_14px_26px_-16px_rgba(16,38,43,.6)]">{{ $t('landing.hero.collageToday') }}</div>
          </div>
        </div>

        <!-- destination carousel -->
        <section
          class="relative z-[2] max-w-[1200px] mx-auto px-6 pt-2"
          aria-roledescription="carousel"
          aria-labelledby="carousel-heading"
          @mouseenter="hovering = true"
          @mouseleave="hovering = false"
          @focusin="focused = true"
          @focusout="onFocusOut"
        >
          <div class="flex gap-3 items-center justify-between flex-wrap pb-3">
            <div class="flex gap-3 items-baseline">
              <h2 id="carousel-heading" class="text-[14px] font-600 text-teal-700">{{ $t('landing.carousel.heading') }}</h2>
              <p class="text-[13px] text-ink-2 tabular-nums" :aria-live="autoplaying ? 'off' : 'polite'">{{ $t('landing.carousel.position', { n: slide + 1, total: places.length }) }}</p>
            </div>
            <div class="flex gap-1 items-center">
              <button type="button" class="w-11 h-11 rounded-full bg-white border border-sand-line flex items-center justify-center text-ink hover:border-sand-line3 transition-colors" :aria-label="playing ? $t('landing.carousel.pause') : $t('landing.carousel.play')" @click="playing = !playing">
                <i :class="playing ? 'i-lucide-pause' : 'i-lucide-play'" class="text-[16px]" aria-hidden="true" />
              </button>
              <button type="button" class="w-11 h-11 rounded-full bg-white border border-sand-line flex items-center justify-center text-ink hover:border-sand-line3 transition-colors" :aria-label="$t('landing.carousel.prev')" @click="nav(slide - 1)">
                <i class="i-lucide-chevron-left text-[16px]" aria-hidden="true" />
              </button>
              <button type="button" class="w-11 h-11 rounded-full bg-white border border-sand-line flex items-center justify-center text-ink hover:border-sand-line3 transition-colors" :aria-label="$t('landing.carousel.next')" @click="nav(slide + 1)">
                <i class="i-lucide-chevron-right text-[16px]" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div
            ref="railEl"
            class="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-[20px] snap-x snap-proximity"
            @scroll.passive="onRailScroll"
            @pointerdown="playing = false"
          >
            <div class="flex gap-4 w-max">
              <div
                v-for="(pl, i) in places"
                :key="pl.name"
                role="group"
                aria-roledescription="slide"
                :aria-label="$t('landing.carousel.position', { n: i + 1, total: places.length })"
                class="flex-[0_0_300px] h-[232px] rounded-[20px] overflow-hidden relative bg-sand-100 snap-start"
              >
                <img :src="pl.photo" alt="" :width="pl.w" :height="pl.h" :loading="i === 0 ? 'eager' : 'lazy'" class="absolute inset-0 w-full h-full object-cover object-[center_58%]">
                <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(16,38,43,0) 40%,rgba(16,38,43,.85) 100%)" />
                <div class="absolute left-4 top-4 bg-paper/95 text-ink-2 rounded-pill px-3 py-1 text-[12px] font-600">{{ $t('landing.places.' + pl.tag) }}</div>
                <div class="absolute left-4 right-4 bottom-4 text-white">
                  <h3 class="font-display text-[18px] font-600">{{ pl.name }}</h3>
                  <div class="flex gap-3 items-center justify-between mt-1 text-[13px] tabular-nums">
                    <span class="text-teal-deep">{{ pl.days }} {{ $t('landing.units.days') }} · {{ pl.people }} {{ $t('landing.units.people') }}</span>
                    <span class="font-600">{{ pl.price }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="flex justify-center mt-1">
            <button
              v-for="(p, i) in places"
              :key="p.name"
              type="button"
              class="h-11 px-1.5 flex items-center"
              :aria-label="$t('landing.carousel.goTo', { n: i + 1, name: p.name })"
              :aria-current="i === slide ? 'true' : undefined"
              @click="nav(i)"
            >
              <span class="block h-2 rounded-pill transition-colors" :class="i === slide ? 'w-6 bg-teal-600' : 'w-2 bg-teal-soft hover:bg-teal-soft2'" />
            </button>
          </div>
        </section>
        <img src="/img/teal-hills.svg" alt="" aria-hidden="true" class="block w-screen ml-[calc(50%-50vw)] mt-6 mb-[-2px] pointer-events-none">
      </section>

      <!-- feature rail -->
      <section id="fitur" class="bg-sand-100 px-6 pt-16 pb-20 scroll-mt-20" aria-labelledby="fitur-title">
        <div class="max-w-[1200px] mx-auto">
          <div class="max-w-[560px]">
            <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.rail.eyebrow') }}</p>
            <h2 id="fitur-title" class="font-display text-[clamp(28px,3.2vw,40px)] font-600 tracking-[-.025em] leading-[1.12] mt-2">{{ $t('landing.rail.title') }}</h2>
          </div>
          <ul class="flex flex-wrap gap-4 mt-8">
            <li v-for="r in rail" :key="r.href" class="flex-[1_1_144px] min-w-[144px] flex">
              <a :href="r.href" class="flex-1 bg-white border border-sand-line rounded-card p-5 flex flex-col gap-2 text-ink hover:text-ink hover:border-sand-line3 transition-colors">
                <span class="w-9 h-9 rounded-[10px] bg-teal-100 text-teal-700 flex items-center justify-center mb-1"><i :class="r.icon" class="text-[18px]" aria-hidden="true" /></span>
                <span class="text-[15px] font-600">{{ $t(r.label) }}</span>
                <span class="text-[13px] leading-[1.5] text-ink-2">{{ $t(r.desc) }}</span>
              </a>
            </li>
          </ul>
        </div>
      </section>

      <!-- feature detail -->
      <div class="max-w-[1200px] mx-auto px-6 pt-20 pb-4 flex flex-col gap-8">
        <!-- hari -->
        <section id="hari" class="bg-white border border-sand-line rounded-hero p-6 md:p-8 flex flex-wrap gap-6 md:gap-8 items-center scroll-mt-24" aria-labelledby="hari-title">
          <div class="flex-1 basis-[300px] min-w-[280px] max-w-[440px]">
            <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.hari.tag') }}</p>
            <h3 id="hari-title" class="font-display text-[28px] font-600 tracking-[-.02em] leading-[1.15] mt-2">{{ $t('landing.hari.title') }}</h3>
            <p class="text-[15px] leading-[1.65] text-ink-2 mt-3">{{ $t('landing.hari.body') }}</p>
            <ul class="flex flex-col gap-2 mt-4 text-[14px] text-ink-2">
              <li v-for="k in ['p1', 'p2']" :key="k" class="flex gap-2"><i class="i-lucide-corner-down-right text-[16px] text-teal-700 shrink-0 mt-0.5" aria-hidden="true" /> {{ $t('landing.hari.' + k) }}</li>
            </ul>
          </div>
          <div class="flex-1 basis-[320px] min-w-[280px] bg-paper border border-sand-line rounded-[20px] p-4 flex flex-col gap-2">
            <div class="flex justify-between items-baseline px-1 pb-1"><div class="text-[15px] font-600">{{ $t('landing.hari.demoDate') }}</div><div class="text-[13px] font-600 text-teal-700 tabular-nums">Rp 745.000</div></div>
            <div class="bg-white border border-sand-line rounded-[12px] px-3 py-3 flex gap-3 items-center">
              <div class="w-9 h-9 rounded-[10px] bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"><i class="i-lucide-ticket text-[16px]" aria-hidden="true" /></div>
              <div class="w-11 shrink-0 text-[13px] font-600 text-ink-2 tabular-nums">05.30</div>
              <div class="flex-1 min-w-0"><div class="text-[14px] font-600">{{ $t('landing.hari.demoAct1') }}</div><div class="text-[12px] text-ink-2 mt-0.5">{{ $t('landing.hari.demoAct1sub') }}</div></div>
              <div class="text-[13px] font-600 whitespace-nowrap tabular-nums">150rb</div>
            </div>
            <div class="bg-white border border-sand-line rounded-[12px] px-3 py-3 flex gap-3 items-center">
              <div class="w-9 h-9 rounded-[10px] bg-sand-100 text-ink-2 flex items-center justify-center shrink-0"><i class="i-lucide-utensils text-[16px]" aria-hidden="true" /></div>
              <div class="w-11 shrink-0 text-[13px] font-600 text-ink-2 tabular-nums">12.30</div>
              <div class="flex-1 min-w-0"><div class="text-[14px] font-600">{{ $t('landing.hari.demoAct2') }}</div><div class="text-[12px] text-ink-2 mt-0.5">{{ $t('landing.hari.demoAct2sub') }}</div></div>
              <div class="text-[13px] font-600 whitespace-nowrap tabular-nums">185rb</div>
            </div>
            <div class="bg-teal-100 rounded-[12px] px-3 py-2 text-[13px] text-teal-700 flex gap-2 items-center"><i class="i-lucide-corner-down-right text-[16px] shrink-0" aria-hidden="true" /> {{ $t('landing.hari.demoNote') }}</div>
          </div>
        </section>

        <!-- anggaran -->
        <section id="anggaran" class="bg-white border border-sand-line rounded-hero p-6 md:p-8 flex flex-wrap-reverse gap-6 md:gap-8 items-center scroll-mt-24" aria-labelledby="anggaran-title">
          <div class="flex-1 basis-[320px] min-w-[280px] bg-paper border border-sand-line rounded-[20px] p-4 flex gap-5 flex-wrap items-center">
            <div class="w-36 h-36 shrink-0 rounded-full flex items-center justify-center" style="background:conic-gradient(var(--teal-600) 0% 34%,var(--brand-green) 34% 58%,var(--brand-amber) 58% 74%,var(--teal-soft-2) 74% 92%,var(--sand-line) 92% 100%)" role="img" :aria-label="`Rp 2,4jt ${$t('landing.anggaran.of')} Rp 3,1jt`">
              <div class="w-24 h-24 rounded-full bg-paper flex flex-col items-center justify-center">
                <div class="text-[18px] font-600 tabular-nums">Rp 2,4jt</div>
                <div class="text-[12px] text-ink-2 mt-0.5 tabular-nums">{{ $t('landing.anggaran.of') }} Rp 3,1jt</div>
              </div>
            </div>
            <div class="flex-1 min-w-[160px] flex flex-col gap-2">
              <div v-for="c in budgetCats" :key="c.k" class="flex justify-between text-[13px]">
                <span class="flex gap-2 items-center"><span class="w-2.5 h-2.5 rounded-[3px]" :style="{ background: c.color }" aria-hidden="true" />{{ $t('landing.anggaran.' + c.k) }}</span>
                <span class="font-600 tabular-nums">{{ c.v }}</span>
              </div>
              <div class="bg-teal-100 text-teal-700 rounded-[10px] px-3 py-2 text-[13px] font-600 mt-1">{{ $t('landing.anggaran.versionNote') }}</div>
            </div>
          </div>
          <div class="flex-1 basis-[300px] min-w-[280px] max-w-[440px]">
            <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.anggaran.tag') }}</p>
            <h3 id="anggaran-title" class="font-display text-[28px] font-600 tracking-[-.02em] leading-[1.15] mt-2">{{ $t('landing.anggaran.title') }}</h3>
            <p class="text-[15px] leading-[1.65] text-ink-2 mt-3">{{ $t('landing.anggaran.body') }}</p>
            <ul class="flex flex-col gap-2 mt-4 text-[14px] text-ink-2">
              <li v-for="k in ['p1', 'p2']" :key="k" class="flex gap-2"><i class="i-lucide-corner-down-right text-[16px] text-teal-700 shrink-0 mt-0.5" aria-hidden="true" /> {{ $t('landing.anggaran.' + k) }}</li>
            </ul>
          </div>
        </section>

        <!-- guides -->
        <section id="panduan" class="bg-white border border-sand-line rounded-hero p-6 md:p-8 flex flex-wrap gap-6 md:gap-8 items-center scroll-mt-24" aria-labelledby="panduan-title">
          <div class="flex-1 basis-[300px] min-w-[280px] max-w-[440px]">
            <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.guides.tag') }}</p>
            <h3 id="panduan-title" class="font-display text-[28px] font-600 tracking-[-.02em] leading-[1.15] mt-2">{{ $t('landing.guides.title') }}</h3>
            <p class="text-[15px] leading-[1.65] text-ink-2 mt-3">{{ $t('landing.guides.body') }}</p>
            <ul class="flex flex-col gap-2 mt-4 text-[14px] text-ink-2">
              <li v-for="k in ['p1', 'p2', 'p3', 'p4']" :key="k" class="flex gap-2"><i class="i-lucide-corner-down-right text-[16px] text-teal-700 shrink-0 mt-0.5" aria-hidden="true" /> {{ $t('landing.guides.' + k) }}</li>
            </ul>
            <NuxtLink :to="localePath('/kurasi')" class="text-[14px] font-600 text-teal-700 hover:text-ink inline-flex items-center gap-1 mt-5 transition-colors">{{ $t('landing.guides.cta') }} <i class="i-lucide-arrow-right text-[16px]" aria-hidden="true" /></NuxtLink>
          </div>
          <div v-if="guides.length" class="flex-1 basis-[320px] min-w-[280px] grid gap-4" style="grid-template-columns:repeat(auto-fit,minmax(min(220px,100%),1fr))">
            <GuideDestinationCard v-for="d in guides.slice(0, 2)" :key="d.id" :destination="d" />
          </div>
        </section>

        <!-- pengeluaran + barang -->
        <div class="grid gap-8" style="grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))">
          <section id="pengeluaran" class="bg-white border border-sand-line rounded-hero overflow-hidden flex flex-col scroll-mt-24" aria-labelledby="pengeluaran-title">
            <img src="/img/img-budget.jpg" alt="" width="1000" height="667" loading="lazy" class="h-44 w-full object-cover bg-sand-100">
            <div class="p-6 md:p-7 flex flex-col gap-4">
              <div>
                <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.expenses.tag') }}</p>
                <h3 id="pengeluaran-title" class="font-display text-[22px] font-600 tracking-[-.015em] mt-2">{{ $t('landing.expenses.title') }}</h3>
                <p class="text-[14px] leading-[1.65] text-ink-2 mt-2">{{ $t('landing.expenses.body') }}</p>
              </div>
              <ul class="bg-paper border border-sand-line rounded-card p-4 flex flex-col gap-3">
                <li v-for="r in expenseRows" :key="r.k" class="flex gap-3 items-center text-[14px]">
                  <i :class="r.icon" class="text-[16px] text-ink-2 shrink-0" aria-hidden="true" /><span class="flex-1">{{ $t('landing.expenses.' + r.k) }}</span><span class="font-600 whitespace-nowrap tabular-nums">{{ r.v }}</span>
                </li>
              </ul>
            </div>
          </section>
          <section id="barang" class="bg-white border border-sand-line rounded-hero overflow-hidden flex flex-col scroll-mt-24" aria-labelledby="barang-title">
            <img src="/img/img-items.webp" alt="" loading="lazy" class="h-44 w-full object-cover bg-sand-100">
            <div class="p-6 md:p-7 flex flex-col gap-4">
              <div>
                <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.packing.tag') }}</p>
                <h3 id="barang-title" class="font-display text-[22px] font-600 tracking-[-.015em] mt-2">{{ $t('landing.packing.title') }}</h3>
                <p class="text-[14px] leading-[1.65] text-ink-2 mt-2">{{ $t('landing.packing.body') }}</p>
              </div>
              <ul class="bg-paper border border-sand-line rounded-card p-4 flex flex-col gap-3 text-[14px]">
                <li class="flex gap-2 items-center"><span class="w-4 h-4 rounded-[5px] bg-teal-700 flex items-center justify-center shrink-0" aria-hidden="true"><i class="i-lucide-check text-white text-[10px]" /></span><s class="text-ink-2">{{ $t('landing.packing.item1') }}</s></li>
                <li class="flex gap-2 items-center"><span class="w-4 h-4 rounded-[5px] border-[1.5px] border-teal-600 shrink-0" aria-hidden="true" />{{ $t('landing.packing.item2') }} <span class="bg-warn-bg text-peach-fg rounded-pill px-2 py-0.5 text-[12px] font-600">{{ $t('landing.packing.must') }}</span></li>
                <li class="flex gap-2 items-center"><span class="w-4 h-4 rounded-[5px] border-[1.5px] border-teal-600 shrink-0" aria-hidden="true" />{{ $t('landing.packing.item3') }}</li>
              </ul>
            </div>
          </section>
        </div>

        <!-- outfit + anggota -->
        <div class="grid gap-8" style="grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))">
          <section id="outfit" class="bg-white border border-sand-line rounded-hero p-6 md:p-7 flex flex-col gap-4 scroll-mt-24" aria-labelledby="outfit-title">
            <div>
              <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.outfit.tag') }}</p>
              <h3 id="outfit-title" class="font-display text-[22px] font-600 tracking-[-.015em] mt-2">{{ $t('landing.outfit.title') }}</h3>
              <p class="text-[14px] leading-[1.65] text-ink-2 mt-2">{{ $t('landing.outfit.body') }}</p>
            </div>
            <dl class="bg-paper border border-sand-line rounded-card p-4 flex flex-col gap-3">
              <div v-for="o in outfitRows" :key="o.k" class="flex gap-3 items-center">
                <div class="w-8 h-8 rounded-[10px] bg-teal-100 text-teal-700 flex items-center justify-center shrink-0" aria-hidden="true"><i :class="o.icon" class="text-[16px]" /></div>
                <div class="flex-1 min-w-0"><dt class="text-[12px] text-ink-2">{{ $t('landing.outfit.' + o.k) }}</dt><dd class="text-[14px]">{{ $t('landing.outfit.' + o.k + 'Val') }}</dd></div>
              </div>
            </dl>
          </section>
          <section id="anggota" class="bg-ink rounded-hero overflow-hidden flex flex-col text-white relative scroll-mt-24" aria-labelledby="anggota-title">
            <img src="/img/teal-palms.svg" alt="" aria-hidden="true" class="absolute right-[-14px] bottom-[-10px] w-[150px] opacity-[.18] pointer-events-none">
            <div class="p-6 md:p-7 flex flex-col gap-4 relative">
              <div>
                <p class="text-[14px] font-600 text-teal-deep">{{ $t('landing.sharing.tag') }}</p>
                <h3 id="anggota-title" class="font-display text-[22px] font-600 tracking-[-.015em] mt-2">{{ $t('landing.sharing.title') }}</h3>
                <p class="text-[14px] leading-[1.65] text-teal-deep mt-2">{{ $t('landing.sharing.body') }}</p>
              </div>
              <div class="bg-white/10 rounded-card p-4 flex flex-col gap-3">
                <div class="flex gap-3 items-center">
                  <div class="flex-1 min-w-0 bg-black/25 rounded-[10px] px-3 py-2 text-[13px] text-teal-deep truncate">kelana.id/t/sumba-4h</div>
                  <div class="bg-primary text-white rounded-pill px-4 py-2 text-[13px] font-600 whitespace-nowrap" aria-hidden="true">{{ $t('landing.sharing.copy') }}</div>
                </div>
                <div v-for="m in members" :key="m.ini" class="flex gap-3 items-center">
                  <div class="w-8 h-8 rounded-full bg-teal-deep text-ink flex items-center justify-center text-[12px] font-600 shrink-0" aria-hidden="true">{{ m.ini }}</div>
                  <div class="flex-1 min-w-0"><div class="text-[14px] font-600">{{ m.name }}</div><div class="text-[12px] text-teal-deep">{{ $t('landing.sharing.' + m.k + 'sub') }}</div></div>
                  <div class="bg-white/20 rounded-pill px-3 py-1 text-[12px] font-600 whitespace-nowrap">{{ $t('landing.sharing.' + m.k + 'role') }}</div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      <!-- isi aplikasi collage -->
      <section id="dalam" class="relative px-6 py-20 overflow-hidden scroll-mt-20" aria-labelledby="dalam-title">
        <img src="/img/teal-cloud.svg" alt="" aria-hidden="true" class="absolute left-[-60px] top-16 w-[220px] opacity-90 pointer-events-none">
        <div class="relative max-w-[1200px] mx-auto">
          <div class="flex flex-wrap gap-5 justify-between items-end">
            <div class="max-w-[520px]">
              <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.inside.eyebrow') }}</p>
              <h2 id="dalam-title" class="font-display text-[clamp(28px,3.2vw,40px)] font-600 tracking-[-.025em] leading-[1.12] mt-2">{{ $t('landing.inside.title') }}</h2>
              <p class="text-[15px] leading-[1.6] text-ink-2 mt-3">{{ $t('landing.inside.body') }}</p>
            </div>
            <NuxtLink :to="appHref" class="bg-ink hover:bg-ink-2 text-white hover:text-white rounded-pill h-12 px-6 inline-flex items-center text-[15px] font-600 whitespace-nowrap transition-colors">{{ $t('landing.inside.tryLive') }}</NuxtLink>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start mt-8">
            <!-- col 1 -->
            <div class="flex flex-col gap-5 lg:mt-4">
              <figure class="bg-white border border-sand-line rounded-[18px] p-2 rotate-[-2deg] shadow-lift">
                <img src="/img/screen-beranda.png" alt="" width="782" height="615" loading="lazy" class="w-full h-auto block rounded-[10px] bg-sand-100">
                <figcaption class="text-[12px] font-600 text-ink-2 px-1 pt-2">{{ $t('landing.inside.cap1') }}</figcaption>
              </figure>
              <div class="bg-teal-100 rounded-[18px] p-4 rotate-[1.4deg]">
                <div class="text-[12px] font-600 text-teal-700">{{ $t('landing.inside.note1') }}</div>
                <div class="text-[15px] font-600 leading-[1.4] mt-2">{{ $t('landing.inside.note1body') }}</div>
              </div>
              <img src="/img/photo-bromo.jpg" alt="" width="1000" height="521" loading="lazy" class="h-32 w-full object-cover rounded-[18px] rotate-[-1.4deg] shadow-[0_24px_42px_-30px_rgba(16,38,43,.5)] bg-sand-100">
            </div>
            <!-- col 2 -->
            <div class="flex flex-col gap-5">
              <img src="/img/photo-kota.jpg" alt="" width="1200" height="800" loading="lazy" class="h-36 w-full object-cover rounded-[18px] rotate-[2deg] shadow-[0_24px_42px_-30px_rgba(16,38,43,.5)] bg-sand-100">
              <figure class="bg-white border border-sand-line rounded-[18px] p-2 rotate-[-1.2deg] shadow-lift">
                <img src="/img/screen-hari.png" alt="" width="1254" height="823" loading="lazy" class="w-full h-auto block rounded-[10px] bg-sand-100">
                <figcaption class="text-[12px] font-600 text-ink-2 px-1 pt-2">{{ $t('landing.inside.cap2') }}</figcaption>
              </figure>
              <figure class="bg-white border border-sand-line rounded-[18px] p-2 rotate-[2.4deg] shadow-lift">
                <img src="/img/screen-anggota.png" alt="" width="1252" height="756" loading="lazy" class="w-full h-auto block rounded-[10px] bg-sand-100">
                <figcaption class="text-[12px] font-600 text-ink-2 px-1 pt-2">{{ $t('landing.inside.cap3') }}</figcaption>
              </figure>
            </div>
            <!-- col 3 -->
            <div class="flex flex-col gap-5 lg:mt-8">
              <figure class="bg-white border border-sand-line rounded-[18px] p-2 rotate-[1.8deg] shadow-lift">
                <img src="/img/screen-anggaran.png" alt="" width="779" height="739" loading="lazy" class="w-full h-auto block rounded-[10px] bg-sand-100">
                <figcaption class="text-[12px] font-600 text-ink-2 px-1 pt-2">{{ $t('landing.inside.cap4') }}</figcaption>
              </figure>
              <div class="bg-ink text-teal-100 rounded-[18px] p-4 rotate-[-2.2deg]">
                <div class="text-[20px] font-600 tabular-nums">Rp 685.000</div>
                <div class="text-[13px] text-teal-deep mt-1">{{ $t('landing.inside.note2sub') }}</div>
              </div>
              <img src="/img/photo-sumba.jpg" alt="" width="1200" height="798" loading="lazy" class="h-28 w-full object-cover rounded-[18px] rotate-[1.2deg] shadow-[0_24px_42px_-30px_rgba(16,38,43,.5)] bg-sand-100">
            </div>
            <!-- col 4 -->
            <div class="flex flex-col gap-5 lg:mt-2">
              <figure class="bg-white border border-sand-line rounded-[18px] p-2 rotate-[2.2deg] shadow-lift">
                <img src="/img/screen-outfit.png" alt="" width="1251" height="760" loading="lazy" class="w-full h-auto block rounded-[10px] bg-sand-100">
                <figcaption class="text-[12px] font-600 text-ink-2 px-1 pt-2">{{ $t('landing.inside.cap5') }}</figcaption>
              </figure>
              <figure class="bg-white border border-sand-line rounded-[18px] p-2 rotate-[-1.8deg] shadow-lift">
                <img src="/img/screen-ringkasan.png" alt="" width="1254" height="821" loading="lazy" class="w-full h-auto block rounded-[10px] bg-sand-100">
                <figcaption class="text-[12px] font-600 text-ink-2 px-1 pt-2">{{ $t('landing.inside.cap6') }}</figcaption>
              </figure>
              <div class="bg-peach-bg rounded-[18px] p-4 rotate-[1.6deg]">
                <div class="text-[12px] font-600 text-peach-fg">{{ $t('landing.inside.note3label') }}</div>
                <div class="text-[15px] font-600 leading-[1.4] mt-2">{{ $t('landing.inside.note3body') }}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- cerita -->
      <section id="cerita" class="bg-ink text-teal-100 px-6 py-20 scroll-mt-20" aria-labelledby="cerita-title">
        <div class="max-w-[1200px] mx-auto">
          <div class="max-w-[560px]">
            <p class="text-[14px] font-600 text-teal-deep">{{ $t('landing.stories.eyebrow') }}</p>
            <h2 id="cerita-title" class="font-display text-[clamp(28px,3.2vw,40px)] font-600 tracking-[-.025em] leading-[1.12] mt-2 text-white">{{ $t('landing.stories.title') }}</h2>
          </div>
          <div class="grid gap-5 mt-8" style="grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))">
            <figure v-for="s in stories" :key="s.who" class="bg-white/[.08] rounded-[20px] p-6 flex flex-col gap-3">
              <blockquote class="flex flex-col gap-3">
                <p class="font-display text-[18px] font-600 leading-[1.3] text-white">{{ $t('landing.stories.' + s.k + 'quote') }}</p>
                <p class="text-[14px] leading-[1.65] text-teal-deep">{{ $t('landing.stories.' + s.k + 'body') }}</p>
              </blockquote>
              <figcaption class="flex gap-3 items-center mt-auto pt-2">
                <div class="w-8 h-8 rounded-full bg-teal-100 text-ink flex items-center justify-center text-[12px] font-600" aria-hidden="true">{{ s.ini }}</div>
                <div><div class="text-[14px] font-600 text-white">{{ s.who }}</div><div class="text-[12px] text-teal-soft2">{{ $t('landing.stories.' + s.k + 'trip') }}</div></div>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <!-- harga -->
      <section id="harga" class="max-w-[1200px] mx-auto px-6 pt-20 pb-8 scroll-mt-20" aria-labelledby="harga-title">
        <div class="flex flex-wrap gap-5 justify-between items-end">
          <div class="max-w-[500px]">
            <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.pricing.eyebrow') }}</p>
            <h2 id="harga-title" class="font-display text-[clamp(28px,3.2vw,40px)] font-600 tracking-[-.025em] leading-[1.12] mt-2">{{ $t('landing.pricing.title') }}</h2>
          </div>
          <BillingPeriodSwitch v-model="period" />
        </div>
        <BillingPlanCards class="mt-8" :period="period" :busy="busy" @select="start($event, period)" />
        <p class="text-[13px] text-ink-2 mt-5">{{ $t('landing.pricing.fineprint') }}</p>
      </section>

      <!-- final cta -->
      <section class="relative mt-16 overflow-hidden" aria-labelledby="cta-title">
        <img src="/img/teal-hills.svg" alt="" aria-hidden="true" class="block w-screen ml-[calc(50%-50vw)] mb-[-2px] pointer-events-none">
        <div class="bg-sand-100 px-6 pb-8 relative">
          <div class="max-w-[1200px] mx-auto flex flex-wrap gap-6 items-center justify-between">
            <div class="flex-1 basis-[380px] min-w-[280px] pt-8 pb-10">
              <p class="text-[14px] font-600 text-teal-700">{{ $t('landing.finalCta.eyebrow') }}</p>
              <h2 id="cta-title" class="font-display text-[clamp(30px,3.6vw,44px)] font-600 tracking-[-.025em] leading-[1.08] mt-2">{{ $t('landing.finalCta.title') }}</h2>
              <p class="text-[15px] leading-[1.6] text-ink-2 mt-3 max-w-[420px]">{{ $t('landing.finalCta.body') }}</p>
              <div class="flex gap-3 flex-wrap mt-6">
                <NuxtLink :to="appHref" class="bg-primary hover:bg-primary-hover text-white hover:text-white rounded-pill h-12 px-6 inline-flex items-center text-[15px] font-600 transition-colors">{{ $t('landing.finalCta.tryFree') }}</NuxtLink>
                <a href="#harga" class="bg-white border border-sand-line hover:border-sand-line3 text-ink hover:text-ink rounded-pill h-12 px-6 inline-flex items-center text-[15px] font-600 transition-colors">{{ $t('landing.finalCta.seePricing') }}</a>
              </div>
            </div>
            <div class="flex-[0_1_380px] min-w-[260px] relative h-[280px] hidden sm:block" aria-hidden="true">
              <img src="/img/photo-ubud.jpg" alt="" width="1200" height="900" loading="lazy" class="absolute right-[6%] top-2 w-[66%] h-[74%] object-cover rounded-[20px] rotate-[2deg] shadow-[0_30px_54px_-34px_rgba(16,38,43,.5)] bg-sand-line">
              <img src="/img/photo-sumba.jpg" alt="" width="1200" height="798" loading="lazy" class="absolute left-0 bottom-0 w-[44%] aspect-square object-cover rounded-[16px] rotate-[-4deg] shadow-[0_24px_42px_-28px_rgba(16,38,43,.5)] bg-sand-line">
            </div>
          </div>
        </div>
      </section>
    </main>

    <!-- footer -->
    <footer class="bg-ink text-teal-deep px-6 py-8">
      <div class="max-w-[1200px] mx-auto flex flex-wrap gap-5 justify-between items-center">
        <CoreLogo :size="26" :text-size="16" variant="light" :weight="800" />
        <nav :aria-label="$t('landing.nav.menu')" class="flex gap-x-5 gap-y-2 flex-wrap text-[14px]">
          <a v-for="a in anchors" :key="a.href" :href="a.href" class="text-teal-deep hover:text-white transition-colors">{{ $t(a.label) }}</a>
          <NuxtLink :to="localePath('/kurasi')" class="text-teal-deep hover:text-white transition-colors">{{ $t('landing.nav.guides') }}</NuxtLink>
          <NuxtLink :to="appHref" class="text-teal-deep hover:text-white transition-colors">{{ $t('landing.footer.openApp') }}</NuxtLink>
        </nav>
        <p class="text-[13px] text-teal-soft2">{{ $t('landing.footer.madeIn') }}</p>
      </div>
    </footer>
  </div>
</template>
