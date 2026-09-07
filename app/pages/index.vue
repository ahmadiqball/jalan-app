<script setup lang="ts">
definePageMeta({ layout: 'blank', public: true })
const { t } = useI18n()
useHead({ title: () => t('landing.metaTitle') })
const session = useSessionStore()
const localePath = useLocalePath()
const appHref = computed(() => localePath(session.authed ? '/beranda' : '/masuk'))

const places = [
  { name: 'Sumba Timur', photo: '/img/photo-sumba.jpg', tag: 'sumba', days: 4, people: 3, price: 'Rp 3,1jt' },
  { name: 'Ubud & Tegallalang', photo: '/img/photo-ubud.jpg', tag: 'ubud', days: 3, people: 2, price: 'Rp 1,85jt' },
  { name: 'Bromo Sunrise', photo: '/img/photo-bromo.jpg', tag: 'bromo', days: 5, people: 4, price: 'Rp 4,6jt' },
  { name: 'Bali Selatan', photo: '/img/photo-kota.jpg', tag: 'bali', days: 4, people: 2, price: 'Rp 2,7jt' },
]
const rail = [
  { label: 'tabs.days', href: '#hari', desc: 'landing.rail.days', icon: 'i-lucide-calendar-days' },
  { label: 'tabs.budget', href: '#anggaran', desc: 'landing.rail.budget', icon: 'i-lucide-wallet' },
  { label: 'tabs.expenses', href: '#pengeluaran', desc: 'landing.rail.expenses', icon: 'i-lucide-receipt' },
  { label: 'tabs.packing', href: '#barang', desc: 'landing.rail.packing', icon: 'i-lucide-backpack' },
  { label: 'tabs.outfit', href: '#outfit', desc: 'landing.rail.outfit', icon: 'i-lucide-shirt' },
  { label: 'landing.rail.sharingLabel', href: '#anggota', desc: 'landing.rail.sharing', icon: 'i-lucide-users' },
]
const stories = [
  { k: 's1', who: 'Dimas P.', ini: 'DP' },
  { k: 's2', who: 'Ayu L.', ini: 'AL' },
  { k: 's3', who: 'Sari H.', ini: 'SR' },
]

const annual = ref(false)
const irp = (n: number) => (n === 0 ? 'Rp 0' : 'Rp ' + n.toLocaleString('id-ID'))
const plans = computed(() =>
  [
    { key: 'free', m: 0, y: 0, featured: false, feats: ['freeF1', 'freeF2', 'freeF3', 'freeF4'] },
    { key: 'plus', m: 29000, y: 290000, featured: true, feats: ['plusF1', 'plusF2', 'plusF3', 'plusF4', 'plusF5'] },
    { key: 'group', m: 79000, y: 790000, featured: false, feats: ['groupF1', 'groupF2', 'groupF3', 'groupF4', 'groupF5'] },
  ].map((p) => ({
    ...p,
    name: t('landing.pricing.' + p.key + 'Name'),
    note: t('landing.pricing.' + p.key + 'Note'),
    cta: t('landing.pricing.' + p.key + 'Cta'),
    price: annual.value ? irp(p.y) : irp(p.m),
    per: p.m === 0 ? t('landing.pricing.forever') : annual.value ? t('landing.pricing.perYear') : t('landing.pricing.perMonth'),
  })),
)

// destination carousel
const railEl = ref<HTMLElement | null>(null)
const slide = ref(0)
let timer: ReturnType<typeof setInterval> | undefined
let paused = false
function go(i: number) {
  slide.value = ((i % places.length) + places.length) % places.length
  const track = railEl.value?.firstElementChild as HTMLElement | undefined
  const card = track?.children[slide.value] as HTMLElement | undefined
  if (track && card && railEl.value) railEl.value.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' })
}
onMounted(() => {
  timer = setInterval(() => { if (!paused) go(slide.value + 1) }, 5000)
})
onBeforeUnmount(() => clearInterval(timer))
function nav(i: number) { paused = true; go(i) }
</script>

<template>
  <div class="min-h-screen overflow-x-hidden">
    <!-- sticky nav -->
    <div class="sticky top-0 z-[60] bg-paper/95 backdrop-blur border-b border-sand-line">
      <div class="max-w-[1200px] mx-auto px-6 py-[13px] flex gap-[18px] items-center">
        <CoreLogo :size="28" :text-size="19" variant="ink" :weight="800" />
        <nav class="flex-1 hidden md:flex gap-6 items-center justify-center text-[14px] font-600 text-ink-2">
          <a href="#fitur" class="hover:text-brand-amber">{{ $t('landing.nav.features') }}</a>
          <a href="#dalam" class="hover:text-brand-amber">{{ $t('landing.nav.inside') }}</a>
          <a href="#cerita" class="hover:text-brand-amber">{{ $t('landing.nav.stories') }}</a>
          <a href="#harga" class="hover:text-brand-amber">{{ $t('landing.nav.pricing') }}</a>
        </nav>
        <div class="ml-auto md:ml-0 flex gap-[10px] items-center">
          <LayoutLangSwitch />
          <NuxtLink :to="appHref" class="text-[13.5px] font-700 text-ink px-1 hidden sm:block">{{ $t('landing.nav.signin') }}</NuxtLink>
          <NuxtLink :to="appHref" class="bg-primary text-white rounded-pill px-[16px] sm:px-[19px] py-[11px] text-[13.5px] font-700 hover:bg-primary-hover">{{ $t('landing.nav.tryFree') }}</NuxtLink>
        </div>
      </div>
    </div>

    <!-- hero -->
    <div class="relative overflow-hidden">
      <img src="/img/teal-cloud.svg" alt="" class="absolute right-[-40px] top-[20px] w-[260px] opacity-90 pointer-events-none z-0">
      <img src="/img/teal-plane.svg" alt="" class="absolute left-[-24px] top-[470px] w-[200px] opacity-75 pointer-events-none z-0 hidden md:block">
      <div class="absolute right-[-120px] top-[60px] w-[520px] h-[520px] rounded-full bg-sand-100 opacity-90 z-0" />

      <div class="relative z-[2] max-w-[1200px] mx-auto px-6 pt-14 pb-8 flex flex-wrap gap-9 items-center">
        <div class="flex-1 basis-[420px] min-w-[300px] max-w-[560px] anim-rise">
          <div class="inline-flex gap-2 items-center bg-white border border-sand-line rounded-pill px-[14px] py-[7px] text-[12.5px] font-700 text-ink-2">
            <span class="w-[6px] h-[6px] rounded-full bg-teal-600" /> {{ $t('landing.hero.badge') }}
          </div>
          <h1 class="text-[clamp(38px,5vw,60px)] font-800 tracking-[-.035em] leading-[1.03] mt-5 [text-wrap:balance]">
            {{ $t('landing.hero.title1') }}<br><span class="text-teal-700">{{ $t('landing.hero.title2') }}</span>
          </h1>
          <p class="text-[17px] leading-[1.62] text-ink-2 mt-[18px] max-w-[470px] [text-wrap:pretty]">
            {{ $t('landing.hero.blurb') }}
          </p>
          <div class="flex gap-3 flex-wrap mt-[26px]">
            <NuxtLink :to="appHref" class="bg-primary text-white rounded-pill px-[26px] py-[15px] text-[15px] font-700 shadow-[0_18px_30px_-18px_rgba(16,38,43,.32)] hover:bg-primary-hover">{{ $t('landing.hero.tryFree') }}</NuxtLink>
            <a href="#dalam" class="bg-white border border-sand-line text-ink rounded-pill px-[22px] py-[14px] text-[14.5px] font-700">{{ $t('landing.hero.seeInside') }}</a>
          </div>
          <div class="flex gap-5 flex-wrap mt-7">
            <div><div class="font-mono text-[20px] font-600">12.400</div><div class="text-[12px] text-ink-2 mt-[2px]">{{ $t('landing.hero.stat1') }}</div></div>
            <div class="w-px bg-sand-line" />
            <div><div class="font-mono text-[20px] font-600">Rp 0</div><div class="text-[12px] text-ink-2 mt-[2px]">{{ $t('landing.hero.stat2') }}</div></div>
            <div class="w-px bg-sand-line" />
            <div><div class="font-mono text-[20px] font-600">4,9</div><div class="text-[12px] text-ink-2 mt-[2px]">{{ $t('landing.hero.stat3') }}</div></div>
          </div>
        </div>

        <!-- hero collage -->
        <div class="flex-1 basis-[440px] min-w-[300px] relative h-[520px] hidden sm:block">
          <div class="absolute right-[2%] top-0 w-[63%] h-[74%] rounded-[24px] overflow-hidden rotate-[-2.5deg] shadow-[0_40px_70px_-34px_rgba(16,38,43,.55)] bg-cover" style="background-image:url('/img/photo-sumba.jpg');background-position:center 56%">
            <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(16,38,43,0) 52%,rgba(16,38,43,.72) 100%)" />
            <div class="absolute left-[14px] top-[14px] bg-paper/95 rounded-[14px] px-3 py-2">
              <div class="text-[10px] font-700 tracking-[.1em] uppercase text-teal-700">{{ $t('landing.hero.collageDay') }}</div>
              <div class="text-[14px] font-800 tracking-[-.02em] mt-[1px]">{{ $t('landing.hero.collageAct') }}</div>
            </div>
          </div>
          <div class="absolute left-0 bottom-[10px] w-[56%] bg-white border border-sand-line rounded-[22px] p-[9px] rotate-[2deg] shadow-[0_34px_60px_-34px_rgba(16,38,43,.5)]">
            <div class="rounded-[16px] overflow-hidden bg-sand-100"><img src="/img/screen-hari.png" alt="" class="w-full block"></div>
          </div>
          <div class="absolute right-0 bottom-[44px] w-[27%] aspect-square rounded-[18px] overflow-hidden rotate-[6deg] shadow-[0_26px_44px_-26px_rgba(16,38,43,.5)] bg-cover bg-center" style="background-image:url('/img/photo-bromo.jpg')" />
          <div class="absolute left-[14%] top-[6px] bg-ink text-teal-100 rounded-pill px-[14px] py-2 font-mono text-[12px] font-600 rotate-[-3deg] shadow-[0_14px_26px_-16px_rgba(16,38,43,.6)]">{{ $t('landing.hero.collageToday') }}</div>
        </div>
      </div>

      <!-- destination carousel -->
      <div class="relative z-[2] max-w-[1200px] mx-auto px-6 pt-[6px]">
        <div class="flex gap-3 items-baseline justify-between flex-wrap px-[2px] pb-3">
          <div class="flex gap-[10px] items-center">
            <div class="text-[12px] font-700 tracking-[.12em] uppercase text-teal-700">{{ $t('landing.carousel.heading') }}</div>
            <div class="font-mono text-[12px] text-ink-2">{{ slide + 1 }} / {{ places.length }}</div>
          </div>
          <div class="flex gap-2 items-center">
            <button class="w-[34px] h-[34px] rounded-full bg-white border border-sand-line flex items-center justify-center hover:border-brand-amber" @click="nav(slide - 1)"><i class="i-lucide-chevron-left text-[16px]" /></button>
            <button class="w-[34px] h-[34px] rounded-full bg-white border border-sand-line flex items-center justify-center hover:border-brand-amber" @click="nav(slide + 1)"><i class="i-lucide-chevron-right text-[16px]" /></button>
          </div>
        </div>
        <div ref="railEl" class="overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-[22px]" style="scroll-snap-type:x proximity">
          <div class="flex gap-[14px] w-max">
            <div v-for="pl in places" :key="pl.name" class="flex-[0_0_300px] h-[230px] rounded-[20px] overflow-hidden relative bg-cover" style="scroll-snap-align:start;background-position:center 58%" :style="{ backgroundImage: `url('${pl.photo}')` }">
              <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(16,38,43,0) 42%,rgba(16,38,43,.84) 100%)" />
              <div class="absolute left-[14px] top-[14px] bg-paper/95 text-ink-2 rounded-pill px-[11px] py-[5px] text-[11px] font-700">{{ $t('landing.places.' + pl.tag) }}</div>
              <div class="absolute left-[14px] right-[14px] bottom-[13px] text-white">
                <div class="text-[17px] font-800 tracking-[-.02em]">{{ pl.name }}</div>
                <div class="flex gap-[10px] items-center justify-between mt-1">
                  <span class="text-[12.5px] text-teal-deep">{{ pl.days }} {{ $t('landing.units.days') }} · {{ pl.people }} {{ $t('landing.units.people') }}</span>
                  <span class="font-mono text-[12.5px] font-600">{{ pl.price }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="flex gap-[7px] justify-center mt-[13px]">
          <button v-for="(p, i) in places" :key="i" class="h-[7px] rounded-pill transition-all" :style="{ width: (i === slide ? 26 : 7) + 'px', background: i === slide ? '#0E6E76' : '#C8E2DE' }" @click="nav(i)" />
        </div>
      </div>
      <img src="/img/teal-hills.svg" alt="" class="block w-screen ml-[calc(50%-50vw)] mt-[26px] mb-[-2px] pointer-events-none">
    </div>

    <!-- feature rail -->
    <div id="fitur" class="bg-sand-100 px-6 pt-[34px] pb-[54px] scroll-mt-[80px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[560px]">
          <div class="text-[12px] font-700 tracking-[.12em] uppercase text-teal-700">{{ $t('landing.rail.eyebrow') }}</div>
          <div class="text-[clamp(25px,3vw,34px)] font-800 tracking-[-.03em] leading-[1.14] mt-[10px]">{{ $t('landing.rail.title') }}</div>
        </div>
        <div class="flex flex-wrap gap-3 mt-6">
          <a v-for="r in rail" :key="r.href" :href="r.href" class="flex-[1_1_172px] min-w-[160px] bg-white border border-sand-line rounded-card p-[15px] flex flex-col gap-2 hover:border-brand-amber transition-colors">
            <div class="w-[34px] h-[34px] rounded-[11px] bg-teal-100 text-teal-700 flex items-center justify-center"><i :class="r.icon" class="text-[18px]" /></div>
            <div class="text-[14.5px] font-700">{{ $t(r.label) }}</div>
            <div class="text-[12.5px] leading-[1.5] text-ink-2">{{ $t(r.desc) }}</div>
          </a>
        </div>
      </div>
    </div>

    <!-- feature detail -->
    <div class="max-w-[1200px] mx-auto px-6 pt-[60px] pb-[10px] flex flex-col gap-5">
      <!-- hari -->
      <div id="hari" class="bg-white border border-sand-line rounded-hero p-[22px] flex flex-wrap gap-[26px] items-center scroll-mt-[90px]">
        <div class="flex-1 basis-[300px] min-w-[280px] max-w-[430px]">
          <span class="inline-flex bg-teal-100 text-teal-700 rounded-pill px-[13px] py-[6px] text-[12px] font-700">{{ $t('landing.hari.tag') }}</span>
          <div class="text-[27px] font-800 tracking-[-.025em] leading-[1.16] mt-[13px]">{{ $t('landing.hari.title') }}</div>
          <p class="text-[14.5px] leading-[1.65] text-ink-2 mt-[11px]">{{ $t('landing.hari.body') }}</p>
          <div class="flex flex-col gap-2 mt-[14px] text-[14px] text-ink-2">
            <div class="flex gap-[9px]"><span class="font-mono text-teal-700 font-700">↳</span> {{ $t('landing.hari.p1') }}</div>
            <div class="flex gap-[9px]"><span class="font-mono text-teal-700 font-700">↳</span> {{ $t('landing.hari.p2') }}</div>
          </div>
        </div>
        <div class="flex-1 basis-[320px] min-w-[300px] bg-paper border border-sand-line rounded-[20px] p-[15px] flex flex-col gap-[9px]">
          <div class="flex justify-between items-baseline"><div class="text-[15px] font-700">{{ $t('landing.hari.demoDate') }}</div><div class="font-mono text-[13px] font-600 text-teal-700">Rp 745.000</div></div>
          <div class="bg-white border border-sand-line rounded-[15px] p-[11px_13px] flex gap-[11px] items-center">
            <div class="w-[36px] h-[36px] rounded-[11px] bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"><i class="i-lucide-ticket text-[17px]" /></div>
            <div class="w-[44px] shrink-0 font-mono text-[12.5px] font-600 text-ink-2">05.30</div>
            <div class="flex-1 min-w-0"><div class="text-[13.5px] font-600">{{ $t('landing.hari.demoAct1') }}</div><div class="text-[11.5px] text-ink-2 mt-[1px]">{{ $t('landing.hari.demoAct1sub') }}</div></div>
            <div class="font-mono text-[13px] font-600 whitespace-nowrap">150rb</div>
          </div>
          <div class="bg-white border border-sand-line rounded-[15px] p-[11px_13px] flex gap-[11px] items-center">
            <div class="w-[36px] h-[36px] rounded-[11px] bg-sand-100 text-ink-2 flex items-center justify-center shrink-0"><i class="i-lucide-utensils text-[17px]" /></div>
            <div class="w-[44px] shrink-0 font-mono text-[12.5px] font-600 text-ink-2">12.30</div>
            <div class="flex-1 min-w-0"><div class="text-[13.5px] font-600">{{ $t('landing.hari.demoAct2') }}</div><div class="text-[11.5px] text-ink-2 mt-[1px]">{{ $t('landing.hari.demoAct2sub') }}</div></div>
            <div class="font-mono text-[13px] font-600 whitespace-nowrap">185rb</div>
          </div>
          <div class="bg-teal-100 rounded-[13px] p-[10px_12px] text-[12.5px] text-teal-700 flex gap-[9px] items-center"><span class="font-mono font-700">↳</span> {{ $t('landing.hari.demoNote') }}</div>
        </div>
      </div>

      <!-- anggaran -->
      <div id="anggaran" class="bg-white border border-sand-line rounded-hero p-[22px] flex flex-wrap-reverse gap-[26px] items-center scroll-mt-[90px]">
        <div class="flex-1 basis-[320px] min-w-[300px] bg-paper border border-sand-line rounded-[20px] p-[17px] flex gap-[18px] flex-wrap items-center">
          <div class="w-[144px] h-[144px] shrink-0 rounded-full flex items-center justify-center" style="background:conic-gradient(#0E6E76 0% 34%,#2F6B54 34% 58%,#D98F3B 58% 74%,#8FC2BE 74% 92%,#EDE9DA 92% 100%)">
            <div class="w-[92px] h-[92px] rounded-full bg-paper flex flex-col items-center justify-center">
              <div class="font-mono text-[18px] font-600">Rp 2,4jt</div>
              <div class="text-[10.5px] text-ink-2 mt-[2px]">{{ $t('landing.anggaran.of') }} Rp 3,1jt</div>
            </div>
          </div>
          <div class="flex-1 min-w-[160px] flex flex-col gap-[9px]">
            <div v-for="[c, col, v] in [[$t('landing.anggaran.cat1'), '#0E6E76', '1,4jt'], [$t('landing.anggaran.cat2'), '#2F6B54', '780rb'], [$t('landing.anggaran.cat3'), '#D98F3B', '450rb'], [$t('landing.anggaran.cat4'), '#8FC2BE', '900rb']]" :key="c" class="flex justify-between text-[12.5px]">
              <span class="flex gap-[7px] items-center"><span class="w-[9px] h-[9px] rounded-[3px]" :style="{ background: col }" />{{ c }}</span>
              <span class="font-mono font-600">{{ v }}</span>
            </div>
            <div class="bg-teal-100 text-teal-700 rounded-[11px] p-[9px_11px] text-[12px] font-700">{{ $t('landing.anggaran.versionNote') }}</div>
          </div>
        </div>
        <div class="flex-1 basis-[300px] min-w-[280px] max-w-[430px]">
          <span class="inline-flex bg-teal-100 text-teal-700 rounded-pill px-[13px] py-[6px] text-[12px] font-700">{{ $t('landing.anggaran.tag') }}</span>
          <div class="text-[27px] font-800 tracking-[-.025em] leading-[1.16] mt-[13px]">{{ $t('landing.anggaran.title') }}</div>
          <p class="text-[14.5px] leading-[1.65] text-ink-2 mt-[11px]">{{ $t('landing.anggaran.body') }}</p>
          <div class="flex flex-col gap-2 mt-[14px] text-[14px] text-ink-2">
            <div class="flex gap-[9px]"><span class="font-mono text-teal-700 font-700">↳</span> {{ $t('landing.anggaran.p1') }}</div>
            <div class="flex gap-[9px]"><span class="font-mono text-teal-700 font-700">↳</span> {{ $t('landing.anggaran.p2') }}</div>
          </div>
        </div>
      </div>

      <!-- pengeluaran + barang -->
      <div class="grid gap-5" style="grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))">
        <div id="pengeluaran" class="bg-white border border-sand-line rounded-hero overflow-hidden flex flex-col scroll-mt-[90px]">
          <div class="h-[170px] bg-cover" style="background-image:url('/img/photo-ubud.jpg');background-position:center 60%" />
          <div class="p-5 flex flex-col gap-[13px]">
            <div>
              <span class="inline-flex bg-teal-100 text-teal-700 rounded-pill px-[13px] py-[6px] text-[12px] font-700 mb-3">{{ $t('landing.expenses.tag') }}</span>
              <div class="text-[21px] font-800 tracking-[-.02em]">{{ $t('landing.expenses.title') }}</div>
              <p class="text-[14px] leading-[1.65] text-ink-2 mt-2">{{ $t('landing.expenses.body') }}</p>
            </div>
            <div class="bg-paper border border-sand-line rounded-card p-[13px] flex flex-col gap-2">
              <div v-for="[m, tx, v] in [['↳', $t('landing.expenses.row1'), '700rb'], ['□', $t('landing.expenses.row2'), '48rb'], ['□', $t('landing.expenses.row3'), '20rb']]" :key="tx" class="flex gap-[10px] items-center text-[13px]">
                <span class="font-mono font-700" :class="m === '↳' ? 'text-teal-700' : 'text-ink-2'">{{ m }}</span><span class="flex-1">{{ tx }}</span><span class="font-mono font-600 whitespace-nowrap">{{ v }}</span>
              </div>
            </div>
          </div>
        </div>
        <div id="barang" class="bg-white border border-sand-line rounded-hero overflow-hidden flex flex-col scroll-mt-[90px]">
          <div class="h-[170px] bg-cover" style="background-image:url('/img/teal-shore.svg');background-position:center 42%" />
          <div class="p-5 flex flex-col gap-[13px]">
            <div>
              <span class="inline-flex bg-teal-100 text-teal-700 rounded-pill px-[13px] py-[6px] text-[12px] font-700 mb-3">{{ $t('landing.packing.tag') }}</span>
              <div class="text-[21px] font-800 tracking-[-.02em]">{{ $t('landing.packing.title') }}</div>
              <p class="text-[14px] leading-[1.65] text-ink-2 mt-2">{{ $t('landing.packing.body') }}</p>
            </div>
            <div class="bg-paper border border-sand-line rounded-card p-[13px] flex flex-col gap-[10px] text-[12.5px]">
              <div class="flex gap-[9px] items-center"><span class="w-[16px] h-[16px] rounded-[5px] bg-teal-700 flex items-center justify-center shrink-0"><i class="i-lucide-check text-white text-[10px]" /></span><span class="text-ink-2 line-through">{{ $t('landing.packing.item1') }}</span></div>
              <div class="flex gap-[9px] items-center"><span class="w-[16px] h-[16px] rounded-[5px] border-[1.6px] border-teal-600 shrink-0" />{{ $t('landing.packing.item2') }} <span class="bg-warn-bg text-[#8F2C16] rounded-pill px-2 py-[2px] text-[10.5px] font-700">{{ $t('landing.packing.must') }}</span></div>
              <div class="flex gap-[9px] items-center"><span class="w-[16px] h-[16px] rounded-[5px] border-[1.6px] border-teal-deep shrink-0" />{{ $t('landing.packing.item3') }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- outfit + anggota -->
      <div class="grid gap-5" style="grid-template-columns:repeat(auto-fit,minmax(min(300px,100%),1fr))">
        <div id="outfit" class="bg-white border border-sand-line rounded-hero p-[22px] flex flex-col gap-[15px] scroll-mt-[90px]">
          <div>
            <span class="inline-flex bg-teal-100 text-teal-700 rounded-pill px-[13px] py-[6px] text-[12px] font-700">{{ $t('landing.outfit.tag') }}</span>
            <div class="text-[21px] font-800 tracking-[-.02em] mt-3">{{ $t('landing.outfit.title') }}</div>
            <p class="text-[14px] leading-[1.65] text-ink-2 mt-2">{{ $t('landing.outfit.body') }}</p>
          </div>
          <div class="bg-paper border border-sand-line rounded-card p-[14px] flex flex-col gap-[11px]">
            <div v-for="[icon, label, val] in [['i-lucide-shirt', $t('landing.outfit.top'), $t('landing.outfit.topVal')], ['i-lucide-rectangle-vertical', $t('landing.outfit.bottom'), $t('landing.outfit.bottomVal')], ['i-lucide-footprints', $t('landing.outfit.shoes'), $t('landing.outfit.shoesVal')]]" :key="label" class="flex gap-[10px] items-center">
              <div class="w-[30px] h-[30px] rounded-[10px] bg-teal-100 text-teal-700 flex items-center justify-center shrink-0"><i :class="icon" class="text-[16px]" /></div>
              <div class="flex-1 min-w-0"><div class="text-[10px] font-700 tracking-[.07em] uppercase text-ink-2">{{ label }}</div><div class="text-[13px]">{{ val }}</div></div>
            </div>
          </div>
        </div>
        <div id="anggota" class="bg-ink rounded-hero overflow-hidden flex flex-col text-white relative scroll-mt-[90px]">
          <img src="/img/teal-palms.svg" alt="" class="absolute right-[-14px] bottom-[-10px] w-[150px] opacity-[.18] pointer-events-none">
          <div class="p-[22px] flex flex-col gap-[15px] relative">
            <div>
              <span class="inline-flex bg-white/15 text-teal-100 rounded-pill px-[13px] py-[6px] text-[12px] font-700">{{ $t('landing.sharing.tag') }}</span>
              <div class="text-[21px] font-800 tracking-[-.02em] mt-3">{{ $t('landing.sharing.title') }}</div>
              <p class="text-[14px] leading-[1.65] text-teal-deep mt-2">{{ $t('landing.sharing.body') }}</p>
            </div>
            <div class="bg-white/10 rounded-card p-[13px] flex flex-col gap-[10px]">
              <div class="flex gap-[10px] items-center">
                <div class="flex-1 min-w-0 bg-black/25 rounded-[11px] px-[11px] py-[9px] font-mono text-[12px] text-teal-deep truncate">kelana.id/t/sumba-4h</div>
                <div class="bg-primary text-white rounded-pill px-[14px] py-2 text-[12px] font-700 whitespace-nowrap">{{ $t('landing.sharing.copy') }}</div>
              </div>
              <div v-for="m in [['DP', 'Dimas Prayoga', $t('landing.sharing.m1sub'), $t('landing.sharing.m1role')], ['AL', 'Ayu Larasati', $t('landing.sharing.m2sub'), $t('landing.sharing.m2role')]]" :key="m[0]" class="flex gap-[10px] items-center">
                <div class="w-[32px] h-[32px] rounded-full bg-teal-deep text-ink flex items-center justify-center text-[12px] font-700 shrink-0">{{ m[0] }}</div>
                <div class="flex-1 min-w-0"><div class="text-[13px] font-600">{{ m[1] }}</div><div class="text-[11px] text-teal-deep">{{ m[2] }}</div></div>
                <div class="bg-white/20 rounded-pill px-[10px] py-[5px] text-[11px] font-700 whitespace-nowrap">{{ m[3] }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- isi aplikasi collage -->
    <div id="dalam" class="relative px-6 pt-16 pb-10 overflow-hidden scroll-mt-[80px]">
      <img src="/img/teal-cloud.svg" alt="" class="absolute left-[-60px] top-[60px] w-[220px] opacity-90 pointer-events-none">
      <div class="relative max-w-[1200px] mx-auto">
        <div class="flex flex-wrap gap-[18px] justify-between items-end">
          <div class="max-w-[520px]">
            <div class="text-[12px] font-700 tracking-[.12em] uppercase text-teal-700">{{ $t('landing.inside.eyebrow') }}</div>
            <div class="text-[clamp(26px,3.2vw,36px)] font-800 tracking-[-.03em] leading-[1.14] mt-[10px]">{{ $t('landing.inside.title') }}</div>
            <p class="text-[14.5px] leading-[1.6] text-ink-2 mt-[10px]">{{ $t('landing.inside.body') }}</p>
          </div>
          <NuxtLink :to="appHref" class="bg-ink text-white rounded-pill px-5 py-3 text-[14px] font-700 whitespace-nowrap">{{ $t('landing.inside.tryLive') }}</NuxtLink>
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[18px] items-start mt-[34px]">
          <!-- col 1 -->
          <div class="flex flex-col gap-[18px] lg:mt-4">
            <div class="bg-white border border-sand-line rounded-[18px] p-[7px] rotate-[-2deg] shadow-[0_24px_44px_-32px_rgba(16,38,43,.55)]">
              <img src="/img/screen-beranda.png" alt="" class="w-full block rounded-[12px]">
              <div class="text-[11.5px] font-700 text-ink-2 px-[3px] pt-2 pb-[1px]">{{ $t('landing.inside.cap1') }}</div>
            </div>
            <div class="bg-teal-100 rounded-[18px] p-[15px] rotate-[1.4deg]">
              <div class="font-mono text-[11px] font-600 text-teal-700">{{ $t('landing.inside.note1') }}</div>
              <div class="text-[14.5px] font-700 leading-[1.35] mt-[6px]">{{ $t('landing.inside.note1body') }}</div>
            </div>
            <div class="h-[130px] rounded-[18px] overflow-hidden rotate-[-1.4deg] bg-cover bg-center shadow-[0_24px_42px_-30px_rgba(16,38,43,.5)]" style="background-image:url('/img/photo-bromo.jpg')" />
          </div>
          <!-- col 2 -->
          <div class="flex flex-col gap-[18px]">
            <div class="h-[150px] rounded-[18px] overflow-hidden rotate-[2deg] bg-cover bg-center shadow-[0_24px_42px_-30px_rgba(16,38,43,.5)]" style="background-image:url('/img/photo-kota.jpg')" />
            <div class="bg-white border border-sand-line rounded-[18px] p-[7px] rotate-[-1.2deg] shadow-[0_24px_44px_-32px_rgba(16,38,43,.55)]">
              <img src="/img/screen-hari.png" alt="" class="w-full block rounded-[12px]">
              <div class="text-[11.5px] font-700 text-ink-2 px-[3px] pt-2 pb-[1px]">{{ $t('landing.inside.cap2') }}</div>
            </div>
            <div class="bg-white border border-sand-line rounded-[18px] p-[7px] rotate-[2.4deg] shadow-[0_24px_44px_-32px_rgba(16,38,43,.55)]">
              <img src="/img/screen-anggota.png" alt="" class="w-full block rounded-[12px]">
              <div class="text-[11.5px] font-700 text-ink-2 px-[3px] pt-2 pb-[1px]">{{ $t('landing.inside.cap3') }}</div>
            </div>
          </div>
          <!-- col 3 -->
          <div class="flex flex-col gap-[18px] lg:mt-9">
            <div class="bg-white border border-sand-line rounded-[18px] p-[7px] rotate-[1.8deg] shadow-[0_24px_44px_-32px_rgba(16,38,43,.55)]">
              <img src="/img/screen-anggaran.png" alt="" class="w-full block rounded-[12px]">
              <div class="text-[11.5px] font-700 text-ink-2 px-[3px] pt-2 pb-[1px]">{{ $t('landing.inside.cap4') }}</div>
            </div>
            <div class="bg-ink text-teal-100 rounded-[18px] p-4 rotate-[-2.2deg]">
              <div class="font-mono text-[20px] font-600">Rp 685.000</div>
              <div class="text-[12px] text-teal-deep mt-[5px]">{{ $t('landing.inside.note2sub') }}</div>
            </div>
            <div class="h-[120px] rounded-[18px] overflow-hidden rotate-[1.2deg] bg-cover bg-center shadow-[0_24px_42px_-30px_rgba(16,38,43,.5)]" style="background-image:url('/img/photo-sumba.jpg')" />
          </div>
          <!-- col 4 -->
          <div class="flex flex-col gap-[18px] lg:mt-2">
            <div class="bg-white border border-sand-line rounded-[18px] p-[7px] rotate-[2.2deg] shadow-[0_24px_44px_-32px_rgba(16,38,43,.55)]">
              <img src="/img/screen-outfit.png" alt="" class="w-full block rounded-[12px]">
              <div class="text-[11.5px] font-700 text-ink-2 px-[3px] pt-2 pb-[1px]">{{ $t('landing.inside.cap5') }}</div>
            </div>
            <div class="bg-white border border-sand-line rounded-[18px] p-[7px] rotate-[-1.8deg] shadow-[0_24px_44px_-32px_rgba(16,38,43,.55)]">
              <img src="/img/screen-ringkasan.png" alt="" class="w-full block rounded-[12px]">
              <div class="text-[11.5px] font-700 text-ink-2 px-[3px] pt-2 pb-[1px]">{{ $t('landing.inside.cap6') }}</div>
            </div>
            <div class="bg-peach-bg rounded-[18px] p-[15px] rotate-[1.6deg]">
              <div class="font-mono text-[11px] font-600 text-peach-fg">{{ $t('landing.inside.note3label') }}</div>
              <div class="text-[14.5px] font-700 leading-[1.35] mt-[6px]">{{ $t('landing.inside.note3body') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- cerita -->
    <div id="cerita" class="bg-ink text-teal-100 px-6 py-[60px] scroll-mt-[80px]">
      <div class="max-w-[1200px] mx-auto">
        <div class="max-w-[560px]">
          <div class="text-[12px] font-700 tracking-[.12em] uppercase text-teal-deep">{{ $t('landing.stories.eyebrow') }}</div>
          <div class="text-[clamp(26px,3.2vw,36px)] font-800 tracking-[-.03em] leading-[1.14] mt-[10px] text-white">{{ $t('landing.stories.title') }}</div>
        </div>
        <div class="grid gap-4 mt-[26px]" style="grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))">
          <div v-for="s in stories" :key="s.who" class="bg-white/[.08] rounded-[22px] p-5 flex flex-col gap-[11px]">
            <div class="flex gap-[3px] text-brand-amber"><i v-for="n in 5" :key="n" class="i-lucide-star text-[14px]" /></div>
            <div class="text-[14.5px] font-700 text-white">{{ $t('landing.stories.' + s.k + 'quote') }}</div>
            <div class="text-[13.5px] leading-[1.65] text-teal-deep">{{ $t('landing.stories.' + s.k + 'body') }}</div>
            <div class="flex gap-[10px] items-center mt-auto">
              <div class="w-[32px] h-[32px] rounded-full bg-teal-100 text-ink flex items-center justify-center text-[12px] font-700">{{ s.ini }}</div>
              <div><div class="text-[13px] font-600 text-white">{{ s.who }}</div><div class="text-[11.5px] text-[#8FC2BE]">{{ $t('landing.stories.' + s.k + 'trip') }}</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- harga -->
    <div id="harga" class="max-w-[1200px] mx-auto px-6 pt-16 pb-5 scroll-mt-[80px]">
      <div class="flex flex-wrap gap-[18px] justify-between items-end">
        <div class="max-w-[500px]">
          <div class="text-[12px] font-700 tracking-[.12em] uppercase text-teal-700">{{ $t('landing.pricing.eyebrow') }}</div>
          <div class="text-[clamp(26px,3.2vw,38px)] font-800 tracking-[-.03em] leading-[1.14] mt-[10px]">{{ $t('landing.pricing.title') }}</div>
        </div>
        <div class="bg-white border border-sand-line rounded-pill p-[5px] flex gap-1">
          <button class="rounded-pill px-[17px] py-[9px] text-[13px] font-700 whitespace-nowrap" :class="!annual ? 'bg-ink text-white' : 'text-ink-2'" @click="annual = false">{{ $t('landing.pricing.monthly') }}</button>
          <button class="rounded-pill px-[17px] py-[9px] text-[13px] font-700 whitespace-nowrap" :class="annual ? 'bg-ink text-white' : 'text-ink-2'" @click="annual = true">{{ $t('landing.pricing.yearly') }}</button>
        </div>
      </div>
      <div class="grid gap-[18px] mt-[26px]" style="grid-template-columns:repeat(auto-fit,minmax(min(280px,100%),1fr))">
        <div v-for="p in plans" :key="p.key" class="rounded-hero p-[22px] flex flex-col gap-[15px] border-[1.5px]" :class="p.featured ? 'bg-ink text-white border-ink' : 'bg-white text-ink border-sand-line'">
          <div class="flex justify-between items-center gap-[10px]">
            <div class="text-[19px] font-800 tracking-[-.02em]">{{ p.name }}</div>
            <span v-if="p.featured" class="bg-primary text-white rounded-pill px-[11px] py-[5px] text-[11px] font-700 whitespace-nowrap">{{ $t('landing.pricing.popular') }}</span>
          </div>
          <div>
            <div class="flex gap-[7px] items-baseline">
              <span class="font-mono text-[31px] font-600 tracking-[-.02em]">{{ p.price }}</span>
              <span class="text-[13px]" :class="p.featured ? 'text-teal-deep' : 'text-ink-2'">{{ p.per }}</span>
            </div>
            <div class="text-[13px] mt-[6px]" :class="p.featured ? 'text-teal-deep' : 'text-ink-2'">{{ p.note }}</div>
          </div>
          <div class="flex flex-col gap-[9px]">
            <div v-for="f in p.feats" :key="f" class="flex gap-[9px] items-start text-[13.5px] leading-[1.5]">
              <i class="i-lucide-check text-[15px] mt-[2px] shrink-0" :class="p.featured ? 'text-teal-deep' : 'text-teal-600'" />
              <span>{{ $t('landing.pricing.' + f) }}</span>
            </div>
          </div>
          <NuxtLink :to="appHref" class="mt-auto text-center rounded-pill py-[13px] text-[14px] font-700" :class="p.featured ? 'bg-teal-600 text-ink' : 'bg-teal-100 text-ink'">{{ p.cta }}</NuxtLink>
        </div>
      </div>
      <div class="text-[12.5px] text-ink-2 mt-[13px]">{{ $t('landing.pricing.fineprint') }}</div>
    </div>

    <!-- final cta -->
    <div class="relative mt-14 overflow-hidden">
      <img src="/img/teal-hills.svg" alt="" class="block w-screen ml-[calc(50%-50vw)] mb-[-2px] pointer-events-none">
      <div class="bg-sand-100 px-6 pb-[34px] relative">
        <div class="max-w-[1200px] mx-auto flex flex-wrap gap-[26px] items-center justify-between">
          <div class="flex-1 basis-[380px] min-w-[280px] pt-[30px] pb-10">
            <div class="text-[12px] font-700 tracking-[.12em] uppercase text-teal-700">{{ $t('landing.finalCta.eyebrow') }}</div>
            <div class="text-[clamp(28px,3.4vw,40px)] font-800 tracking-[-.03em] leading-[1.08] mt-[11px]">{{ $t('landing.finalCta.title') }}</div>
            <p class="text-[15px] leading-[1.6] text-ink-2 mt-[11px] max-w-[420px]">{{ $t('landing.finalCta.body') }}</p>
            <div class="flex gap-3 flex-wrap mt-5">
              <NuxtLink :to="appHref" class="bg-primary text-white rounded-pill px-[26px] py-[15px] text-[15px] font-700 hover:bg-primary-hover">{{ $t('landing.finalCta.tryFree') }}</NuxtLink>
              <a href="#harga" class="bg-white text-ink rounded-pill px-6 py-[15px] text-[14.5px] font-700">{{ $t('landing.finalCta.seePricing') }}</a>
            </div>
          </div>
          <div class="flex-[0_1_380px] min-w-[260px] relative h-[280px] hidden sm:block">
            <div class="absolute right-[6%] top-[10px] w-[66%] h-[74%] rounded-[22px] overflow-hidden rotate-[2deg] shadow-[0_30px_54px_-34px_rgba(16,38,43,.5)] bg-cover bg-center" style="background-image:url('/img/photo-ubud.jpg')" />
            <div class="absolute left-0 bottom-0 w-[44%] aspect-square rounded-[18px] overflow-hidden rotate-[-4deg] shadow-[0_24px_42px_-28px_rgba(16,38,43,.5)] bg-cover bg-center" style="background-image:url('/img/photo-sumba.jpg')" />
          </div>
        </div>
      </div>
    </div>

    <!-- footer -->
    <footer class="bg-ink text-teal-deep px-6 py-[30px]">
      <div class="max-w-[1200px] mx-auto flex flex-wrap gap-[18px] justify-between items-center">
        <CoreLogo :size="26" :text-size="16" variant="light" :weight="800" />
        <div class="flex gap-5 flex-wrap text-[13px]">
          <a href="#fitur" class="text-teal-deep hover:text-white">{{ $t('landing.nav.features') }}</a>
          <a href="#dalam" class="text-teal-deep hover:text-white">{{ $t('landing.nav.inside') }}</a>
          <a href="#harga" class="text-teal-deep hover:text-white">{{ $t('landing.nav.pricing') }}</a>
          <NuxtLink :to="appHref" class="text-teal-deep hover:text-white">{{ $t('landing.footer.openApp') }}</NuxtLink>
        </div>
        <div class="text-[12.5px] text-[#8FC2BE]">{{ $t('landing.footer.madeIn') }}</div>
      </div>
    </footer>
  </div>
</template>
