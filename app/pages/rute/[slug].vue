<script setup lang="ts">
import type { Trip } from '~/types/domain'

// Rute Kelana story page: built entirely from the route's own data (story fields,
// day titles, per-activity why/tip, budget). Public, so it can be shared.
definePageMeta({ public: true })

const route = useRoute()
const localePath = useLocalePath()
const session = useSessionStore()
const trips = useTripsStore()
const { flash } = useToast()
const { rp } = useMoney()
const { t } = useI18n()
const { apiFetch } = useApi()
const { requireTripSlot } = useSubscription()
const { templates } = useTemplatesList()

const slug = computed(() => String(route.params.slug))

// drafts are not in the public list; an admin previewing one gets it from the admin list
const draft = ref<Trip | null>(null)
const lookedForDraft = ref(false)
const live = computed(() => findRoute(templates.value, slug.value))
const tp = computed(() => live.value || draft.value)
onMounted(async () => {
  if (live.value || !session.authed) { lookedForDraft.value = true; return }
  try { draft.value = findRoute(await apiFetch<Trip[]>('/api/admin/templates'), slug.value) } catch { /* not an admin */ }
  lookedForDraft.value = true
})

const total = computed(() => (tp.value ? routeTotal(tp.value) : 0))
const budget = computed(() => (tp.value ? routeBudget(tp.value) : []))
const perPerson = computed(() => (tp.value ? routePerPerson(tp.value) : 0))
const length = computed(() => (tp.value ? routeLength(tp.value) : ''))
// licence attributions for every credited photo, shown once at the end of the page
const credits = computed(() => {
  const r = tp.value
  if (!r) return []
  const out: { what: string; credit: string; source?: string }[] = []
  if (r.cover && r.story?.coverCredit) out.push({ what: 'Cover', credit: r.story.coverCredit, source: r.story.coverSource })
  for (const d of r.days) for (const a of d.acts) if (a.photo && a.photoCredit) out.push({ what: a.place || a.title, credit: a.photoCredit, source: a.photoSource })
  return out
})
const pct = (x: number) => `${Math.round(x * 100)}%`
// legend <-> bar hover link: the hovered category stays, the rest step back
const hoverCat = ref<string | null>(null)
const actCount = computed(() => tp.value?.days.reduce((n, d) => n + d.acts.length, 0) || 0)
// "Belum diberi nama" is the editor's legacy placeholder, not a real name
const dayTitle = (title: string, i: number) => (title && title !== 'Belum diberi nama' ? title : `Hari ke-${i + 1}`)
const where = computed(() => (tp.value?.place || '').split(',')[0]?.trim() || '')

const facts = computed(() => {
  const r = tp.value
  if (!r) return []
  return [
    ['i-lucide-calendar-days', `${length.value} · ${actCount.value} aktivitas`],
    ['i-lucide-wallet', `± ${rp(perPerson.value)} per orang`],
    r.story?.bestTime ? ['i-lucide-sun', `Terbaik ${r.story.bestTime}`] : null,
    r.story?.goodFor ? ['i-lucide-users', `Cocok untuk ${r.story.goodFor}`] : null,
  ].filter(Boolean) as [string, string][]
})

useSeoMeta({
  title: () => (tp.value ? `${tp.value.name} · Rute Kelana` : 'Rute Kelana'),
  description: () => tp.value?.story?.intro || (tp.value ? `Rute ${tp.value.days.length} hari di ${tp.value.place} yang disusun Kelana, lengkap dengan alasan, tips, dan anggaran.` : ''),
  ogImage: () => tp.value?.cover || undefined,
})

const creating = ref(false)
async function createSimilar() {
  const r = tp.value
  if (!r || creating.value) return
  if (!session.authed) return navigateTo(localePath(`/masuk?next=${encodeURIComponent(route.fullPath)}`))
  if (!requireTripSlot()) return
  creating.value = true
  try {
    const id = trips.cloneTrip(r, { owner: { name: session.name, email: session.email } })
    flash(t('app.templates.used'))
    await navigateTo(localePath(`/trip/${id}/days`))
  } finally {
    creating.value = false
  }
}
</script>

<template>
  <div class="flex-1 w-full pb-[96px] md:pb-0">
    <!-- not found (wait for the draft lookup before saying so) -->
    <div v-if="!tp && lookedForDraft" class="max-w-[700px] mx-auto p-16 text-center text-muted">
      Rute tidak ditemukan. <NuxtLink :to="localePath('/rute')" class="text-teal-600 font-600">Lihat semua rute</NuxtLink>
    </div>
    <div v-else-if="!tp" class="max-w-[1100px] mx-auto p-[30px_20px] md:p-[30px_32px] flex flex-col gap-4">
      <CoreSkeleton class="h-[420px] w-full" rounded="rounded-hero" />
      <CoreSkeleton class="h-6 w-1/2" />
    </div>

    <article v-else>
      <div v-if="tp.published === false" class="bg-sand-100 border-b border-sand-line">
        <div class="max-w-[1100px] mx-auto px-[20px] md:px-[32px] py-[10px] text-[13px] text-ink-2 flex items-center gap-2">
          <AdminPublishBadge :published="false" /> Pratinjau draf. Halaman ini belum terlihat oleh pengguna.
        </div>
      </div>

      <!-- hero: the route's own photograph, full bleed -->
      <header class="relative overflow-hidden bg-ink min-h-[540px] h-[78vh] max-h-[720px] flex items-end">
        <img v-if="tp.cover" :src="tp.cover" :alt="tp.name" class="absolute inset-0 w-full h-full object-cover" fetchpriority="high">
        <CoreCover v-else :mat="tp.mat" :photo-size="0" class="!absolute inset-0" />
        <div class="absolute inset-0" style="background:linear-gradient(180deg,rgba(16,38,43,0) 30%,rgba(16,38,43,.55) 62%,rgba(16,38,43,.86) 100%)" aria-hidden="true" />
        <div class="relative w-full max-w-[1100px] mx-auto px-[20px] md:px-[32px] pb-[34px] md:pb-[52px] text-white anim-rise">
          <NuxtLink :to="localePath('/rute')" class="inline-flex items-center gap-1 text-[13px] font-600 text-white/80 hover:text-white min-h-[44px]">
            <i class="i-lucide-chevron-left text-[16px]" aria-hidden="true" /> Rute Kelana
          </NuxtLink>
          <h1 class="font-display font-700 leading-[0.98] tracking-[-.02em] text-[clamp(38px,6.4vw,74px)] max-w-[16ch] mt-1">{{ tp.name }}</h1>
          <p v-if="tp.place" class="text-[15px] md:text-[17px] text-white/85 mt-3 flex items-center gap-[6px]">
            <i class="i-lucide-map-pin text-[16px]" aria-hidden="true" /> {{ tp.place }}
          </p>
          <ul class="flex flex-wrap gap-x-5 gap-y-2 mt-5 text-[14px] font-600 text-white/95">
            <li v-for="[icon, text] in facts" :key="text" class="flex items-center gap-[7px] money">
              <i :class="icon" class="text-[16px] text-teal-soft" aria-hidden="true" /> {{ text }}
            </li>
          </ul>
          <div class="hidden md:flex items-center gap-4 mt-7">
            <CoreButton variant="primary" :disabled="creating" class="active:scale-[.98]" @click="createSimilar">
              <i class="i-lucide-copy-plus text-[16px]" aria-hidden="true" /> {{ creating ? 'Membuat…' : 'Buat trip serupa' }}
            </CoreButton>
            <span class="text-[13.5px] text-white/80">Semua bisa kamu ubah setelahnya.</span>
          </div>
        </div>
      </header>

      <div class="max-w-[1100px] mx-auto px-[20px] md:px-[32px]">
        <!-- why this route -->
        <section v-if="tp.story?.intro" class="py-[48px] md:py-[72px] grid gap-4 md:grid-cols-[220px_1fr] md:gap-10" :class="tp.story?.reasons?.length ? '' : 'border-b border-sand-line'" aria-labelledby="why-title">
          <h2 id="why-title" class="eyebrow pt-[6px]">Kenapa rute ini</h2>
          <p class="font-display text-[22px] md:text-[28px] leading-[1.35] tracking-[-.01em] text-ink max-w-[34ch] md:max-w-[38ch]">{{ tp.story.intro }}</p>
        </section>

        <!-- why the order works: the reason to pick this over planning it yourself -->
        <section v-if="tp.story?.reasons?.length" class="pb-[48px] md:pb-[72px] grid gap-5 md:grid-cols-[220px_1fr] md:gap-10 border-b border-sand-line" :class="tp.story?.intro ? '' : 'pt-[48px] md:pt-[72px]'" aria-labelledby="order-title">
          <h2 id="order-title" class="eyebrow pt-[6px]">Kenapa susunannya begini</h2>
          <ol class="grid gap-x-8 gap-y-6 sm:grid-cols-2">
            <li v-for="(r, ri) in tp.story.reasons" :key="ri" class="flex gap-4">
              <span class="font-display text-[26px] font-700 text-teal-600 leading-none money shrink-0 w-[34px]">{{ String(ri + 1).padStart(2, '0') }}</span>
              <span class="text-[15.5px] text-ink leading-[1.55] pt-[3px]">{{ r }}</span>
            </li>
          </ol>
        </section>

        <!-- day by day -->
        <section class="py-[48px] md:py-[72px] border-b border-sand-line" aria-labelledby="days-title">
          <h2 id="days-title" class="font-display text-[28px] md:text-[34px] font-600 tracking-[-.01em]">Hari demi hari</h2>
          <div class="flex flex-col mt-8">
            <div
              v-for="(d, di) in tp.days"
              :key="di"
              class="grid gap-4 md:grid-cols-[220px_1fr] md:gap-10 py-8"
              :class="di > 0 ? 'border-t border-sand-line' : 'pt-0'"
            >
              <div class="md:sticky md:top-[96px] self-start">
                <div class="eyebrow">Hari {{ di + 1 }}</div>
                <h3 class="font-display text-[21px] md:text-[23px] font-600 leading-[1.2] mt-1">{{ dayTitle(d.title, di) }}</h3>
                <div v-if="d.acts.length" class="text-[13px] text-muted mt-1">{{ d.acts.length }} aktivitas</div>
              </div>

              <div class="min-w-0">
              <p v-if="d.story" class="text-[16px] md:text-[17px] text-ink leading-[1.6] max-w-[60ch] mb-7">{{ d.story }}</p>
              <ol v-if="d.acts.length" class="flex flex-col">
                <li v-for="(a, ai) in d.acts" :key="a.id" class="relative grid grid-cols-[40px_1fr] gap-x-4">
                  <!-- timeline rail -->
                  <span v-if="ai < d.acts.length - 1" class="absolute left-[19px] top-[44px] bottom-0 w-[2px] bg-sand-line" aria-hidden="true" />
                  <span class="w-[40px] h-[40px] rounded-full flex items-center justify-center relative" :style="{ background: tone(a.cat)[0], color: tone(a.cat)[1] }">
                    <i :class="catIcon(tp.catIcons, a.cat)" class="text-[17px]" aria-hidden="true" />
                  </span>
                  <div class="pb-7">
                    <div class="flex items-baseline gap-x-3 gap-y-1 flex-wrap">
                      <span v-if="a.time" class="text-[13px] font-700 text-muted money">{{ a.time }}</span>
                      <h4 class="text-[16.5px] font-700 text-ink leading-snug">{{ a.title || a.place || catLabel(a.cat) }}</h4>
                    </div>
                    <div v-if="a.place && a.place !== a.title" class="text-[13.5px] text-muted mt-[3px] flex items-center gap-1">
                      <i class="i-lucide-map-pin text-[13px]" aria-hidden="true" /> {{ a.place }}
                    </div>
                    <div v-if="a.photo" class="mt-4 rounded-[18px] overflow-hidden aspect-[16/10] max-w-[560px] bg-sand-100">
                      <img :src="a.photo" :alt="a.place || a.title" loading="lazy" class="w-full h-full object-cover transition-transform duration-500 hover:scale-[1.03]">
                    </div>
                    <p v-if="a.what" class="text-[15px] text-ink-2 leading-[1.6] mt-3 max-w-[60ch]">{{ a.what }}</p>
                    <p v-if="a.why" class="text-[15px] text-ink-2 leading-[1.6] mt-3 max-w-[60ch]">
                      <span class="font-700 text-teal-700">Kenapa ke sini:</span> {{ a.why }}
                    </p>
                    <div v-if="a.tip" class="mt-3 bg-sand-100 rounded-[14px] p-[11px_14px] text-[14px] text-ink-2 flex gap-[10px] max-w-[60ch]">
                      <i class="i-lucide-lightbulb text-[17px] text-warn-fg2 shrink-0 mt-[1px]" aria-hidden="true" />
                      <span><span class="font-700 text-ink">Tips:</span> {{ a.tip }}</span>
                    </div>
                  </div>
                </li>
              </ol>
              <p v-else-if="!d.story" class="text-[14px] text-muted">Hari bebas. Atur sesukamu.</p>
              </div>
            </div>
          </div>
        </section>

        <!-- budget: per person first, then where the money goes (shares of the total) -->
        <section v-if="budget.length" class="py-[48px] md:py-[72px] grid gap-6 md:grid-cols-[220px_1fr] md:gap-10 border-b border-sand-line" aria-labelledby="budget-title">
          <h2 id="budget-title" class="eyebrow pt-[6px]">Perkiraan anggaran</h2>
          <div class="min-w-0">
            <div class="flex items-baseline gap-x-2 flex-wrap">
              <span class="font-display text-[36px] md:text-[44px] font-700 leading-none money">± {{ rp(perPerson) }}</span>
              <span class="text-[16px] font-600 text-ink-2">per orang</span>
            </div>
            <p class="text-[14.5px] text-ink-2 mt-3">
              Total <span class="font-700 text-ink money">{{ rp(total) }}</span> untuk <span class="font-700 text-ink">{{ tp.people }} orang</span>, <span class="font-700 text-ink">{{ length }}</span>.
            </p>
            <p class="text-[13.5px] text-muted mt-1 flex items-center gap-[6px]">
              <i class="i-lucide-info text-[14px] shrink-0" aria-hidden="true" /> {{ tp.story?.budgetNote || DEFAULT_BUDGET_NOTE }}
            </p>

            <!-- one stacked bar: each category's share of the total, 2px surface gaps between fills -->
            <div class="flex h-[14px] gap-[2px] mt-7" role="img" :aria-label="'Pembagian anggaran: ' + budget.map((b) => `${catLabel(b.cat)} ${pct(b.share)}`).join(', ')">
              <span
                v-for="(b, bi) in budget"
                :key="b.cat"
                class="h-full transition-opacity duration-150"
                :class="[bi === 0 ? 'rounded-l-[4px]' : '', bi === budget.length - 1 ? 'rounded-r-[4px]' : '', hoverCat && hoverCat !== b.cat ? 'opacity-35' : '']"
                :style="{ width: b.share * 100 + '%', background: b.color }"
                :title="`${catLabel(b.cat)}: ${pct(b.share)}, ${rp(b.amount)}`"
                @mouseenter="hoverCat = b.cat"
                @mouseleave="hoverCat = null"
              />
            </div>

            <!-- legend doubles as the table view: name, share, per-person and total amounts in text -->
            <ul class="mt-5 flex flex-col">
              <li
                v-for="b in budget"
                :key="b.cat"
                class="grid grid-cols-[12px_1fr_auto] sm:grid-cols-[12px_1fr_56px_auto] items-baseline gap-x-3 py-[11px] border-b border-sand-line last:border-b-0 transition-opacity duration-150"
                :class="hoverCat && hoverCat !== b.cat ? 'opacity-50' : ''"
                @mouseenter="hoverCat = b.cat"
                @mouseleave="hoverCat = null"
              >
                <span class="w-[12px] h-[12px] rounded-[3px] self-center" :style="{ background: b.color }" aria-hidden="true" />
                <span class="text-[14.5px] font-600 text-ink">{{ catLabel(b.cat) }} <span class="sm:hidden text-muted font-500 money">· {{ pct(b.share) }}</span></span>
                <span class="hidden sm:block text-[14px] text-muted money text-right">{{ pct(b.share) }}</span>
                <span class="text-right">
                  <span class="text-[14.5px] font-600 text-ink money">{{ rp(Math.round(b.amount / Math.max(1, tp.people))) }}</span><span class="text-[12.5px] text-muted">/orang</span>
                </span>
              </li>
            </ul>
          </div>
        </section>

        <!-- close -->
        <section class="py-[48px] md:py-[72px]" aria-labelledby="close-title">
          <div class="bg-teal-100 rounded-hero p-[28px_22px] md:p-[44px_48px] flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
            <div class="flex-1">
              <h2 id="close-title" class="font-display text-[26px] md:text-[32px] font-600 leading-[1.15] tracking-[-.01em]">Siap jalan{{ where ? ` ke ${where}` : '' }}?</h2>
              <p class="text-[15px] text-ink-2 leading-[1.6] mt-3 max-w-[52ch]">
                Rute ini kami salin jadi trip kamu, termasuk anggaran, daftar barang, dan catatan tiap tempat. Setelah itu semuanya bisa kamu ubah.
              </p>
            </div>
            <CoreButton variant="primary" :disabled="creating" class="shrink-0 active:scale-[.98]" @click="createSimilar">
              <i class="i-lucide-copy-plus text-[16px]" aria-hidden="true" /> {{ creating ? 'Membuat…' : 'Buat trip serupa' }}
            </CoreButton>
          </div>
        </section>
      </div>

      <!-- photo credits: one line, as the licences ask -->
      <div v-if="credits.length" class="max-w-[1100px] mx-auto px-[20px] md:px-[32px] pb-[40px] -mt-[24px]">
        <p class="text-[12px] text-muted leading-[1.7]">
          <span class="font-700">Kredit foto:</span>
          <template v-for="(c, ci) in credits" :key="ci">
            {{ c.what }}: <a v-if="c.source" :href="c.source" target="_blank" rel="noopener" class="underline decoration-sand-line3 hover:text-ink">{{ c.credit }}</a><template v-else>{{ c.credit }}</template>{{ ci < credits.length - 1 ? ' · ' : '.' }}
          </template>
        </p>
      </div>

      <!-- phone: the main action stays in reach -->
      <div class="md:hidden fixed inset-x-0 bottom-0 z-30 bg-white/95 backdrop-blur border-t border-sand-line px-4 pt-3" style="padding-bottom:max(12px, env(safe-area-inset-bottom))">
        <CoreButton variant="primary" block :disabled="creating" class="active:scale-[.98]" @click="createSimilar">
          <i class="i-lucide-copy-plus text-[16px]" aria-hidden="true" /> {{ creating ? 'Membuat…' : 'Buat trip serupa' }}
        </CoreButton>
        <div class="text-[12px] text-muted text-center mt-[6px]">Semua bisa kamu ubah setelahnya.</div>
      </div>
    </article>
  </div>
</template>
