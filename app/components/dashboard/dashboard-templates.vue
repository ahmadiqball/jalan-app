<script setup lang="ts">
/**
 * "Mulai dari Rute Kelana" on the home page: wide route banners in a row you
 * swipe or scroll sideways, with dots and arrows underneath. Nothing moves on
 * its own; the row snaps card by card.
 */
const { t } = useI18n()
const localePath = useLocalePath()
const { templates } = useTemplatesList()
const picks = computed(() => templates.value.slice(0, 10))

const track = ref<HTMLElement | null>(null)
const active = ref(0)
const atStart = ref(true)
const atEnd = ref(false)

function slides(): HTMLElement[] {
  return track.value ? ([...track.value.children] as HTMLElement[]) : []
}
function update() {
  const el = track.value
  if (!el) return
  const max = el.scrollWidth - el.clientWidth
  atStart.value = el.scrollLeft <= 4
  atEnd.value = el.scrollLeft >= max - 4
  if (atEnd.value) { active.value = picks.value.length - 1; return }
  const left = el.getBoundingClientRect().left
  let best = 0
  let dist = Infinity
  slides().forEach((s, i) => {
    const d = Math.abs(s.getBoundingClientRect().left - left)
    if (d < dist) { dist = d; best = i }
  })
  active.value = best
}
function go(i: number) {
  const el = track.value
  const s = slides()[Math.max(0, Math.min(i, picks.value.length - 1))]
  if (!el || !s) return
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollTo({ left: s.offsetLeft - el.offsetLeft - 6, behavior: reduce ? 'auto' : 'smooth' })
}
onMounted(() => nextTick(update))
watch(picks, () => nextTick(update))
</script>

<template>
  <section v-if="picks.length" aria-labelledby="home-routes-title" class="flex flex-col gap-4 mt-2">
    <div class="flex justify-between items-end gap-4">
      <div>
        <h2 id="home-routes-title" class="font-display text-[20px] font-600">{{ $t('app.templates.startTitle') }}</h2>
        <p class="text-[13.5px] text-muted mt-[2px]">{{ $t('app.templates.startSub') }}</p>
      </div>
      <NuxtLink :to="localePath('/rute')" class="min-h-11 inline-flex items-center gap-1 text-[14px] font-600 text-teal-700 hover:text-teal-600 shrink-0 transition-colors">{{ $t('app.templates.seeAll') }} <i class="i-lucide-arrow-right text-[15px]" aria-hidden="true" /></NuxtLink>
    </div>

    <!-- -m/p of 6px leaves room for the focus outline without clipping -->
    <div
      ref="track"
      class="route-track relative flex gap-[18px] overflow-x-auto snap-x snap-mandatory p-[6px] -m-[6px]"
      role="region"
      :aria-label="t('app.templates.carousel')"
      @scroll.passive="update"
    >
      <div
        v-for="(tp, i) in picks"
        :key="tp.id"
        class="snap-start shrink-0 w-[86%] sm:w-[70%] lg:w-[62%] xl:w-[46%]"
        role="group"
        :aria-label="t('app.templates.slide', { n: i + 1, total: picks.length })"
      >
        <RouteBanner :route="tp" />
      </div>
    </div>

    <div v-if="picks.length > 1" class="flex items-center justify-between gap-4">
      <div class="w-[96px] hidden sm:block" aria-hidden="true" />
      <div class="flex items-center justify-center flex-wrap">
        <button
          v-for="(tp, i) in picks"
          :key="tp.id"
          type="button"
          class="w-[22px] h-11 flex items-center justify-center group/dot"
          :aria-label="t('app.templates.slide', { n: i + 1, total: picks.length })"
          :aria-current="i === active ? 'true' : undefined"
          @click="go(i)"
        >
          <span
            class="block h-[7px] rounded-full transition-all duration-300 motion-reduce:transition-none"
            :class="i === active ? 'w-[18px] bg-ink' : 'w-[7px] bg-sand-line3 group-hover/dot:bg-muted'"
          />
        </button>
      </div>
      <div class="flex gap-2 shrink-0">
        <button
          type="button"
          class="w-11 h-11 rounded-full border border-sand-line2 bg-white text-ink flex items-center justify-center transition-colors hover:border-teal-600 hover:text-teal-700 disabled:opacity-40 disabled:pointer-events-none"
          :aria-label="t('app.templates.prev')"
          :disabled="atStart"
          @click="go(active - 1)"
        >
          <i class="i-lucide-chevron-left text-[18px]" aria-hidden="true" />
        </button>
        <button
          type="button"
          class="w-11 h-11 rounded-full border border-sand-line2 bg-white text-ink flex items-center justify-center transition-colors hover:border-teal-600 hover:text-teal-700 disabled:opacity-40 disabled:pointer-events-none"
          :aria-label="t('app.templates.next')"
          :disabled="atEnd"
          @click="go(active + 1)"
        >
          <i class="i-lucide-chevron-right text-[18px]" aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.route-track { scrollbar-width: none; scroll-padding-left: 6px; }
.route-track::-webkit-scrollbar { display: none; }
</style>
