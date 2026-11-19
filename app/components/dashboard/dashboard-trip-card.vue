<script setup lang="ts">
import type { Trip } from '~/types/domain'
import { rp } from '~/utils/format'
import { tripCover } from '~/utils/categories'
import { DropdownMenuRoot, DropdownMenuTrigger, DropdownMenuPortal, DropdownMenuContent, DropdownMenuItem } from 'reka-ui'

/**
 * A trip on the home page: the photo fills a landscape card; name, dates and
 * budget sit on a dark gradient at the bottom, status at the bottom right, and
 * a "…" menu at the top right.
 *
 * The whole card is one link (the title link stretches over it, so there is a
 * single accessible link and no button nested inside an anchor); the menu
 * button sits above that link.
 */
const props = defineProps<{ trip: Trip }>()
const { t } = useI18n()
const trips = useTripsStore()
const { flash } = useToast()
const { confirm } = useConfirm()
const { isOwner } = useTripAccess()

const cover = computed(() => tripCover(props.trip))
const to = computed(() => `/trip/${props.trip.id}/overview`)
const dayCount = computed(() => props.trip.days?.length || 0)
const dateLine = computed(() =>
  props.trip.dates ? `${props.trip.dates} · ${t('app.templates.days', { n: dayCount.value }, dayCount.value)}` : t('app.card.noDates'),
)
const budget = computed(() => (props.trip.plan > 0 ? rp(props.trip.plan) : t('app.card.noBudget')))
const live = computed(() => props.trip.status === 'live')

async function del() {
  const ok = await confirm({
    title: t('confirm.delTripTitle'),
    message: t('confirm.delTripMsg', { name: props.trip.name }),
    confirmLabel: t('confirm.delTripCta'),
    danger: true,
  })
  if (!ok) return
  trips.deleteTrip(props.trip.id) // the sync plugin issues the server DELETE
  flash('Trip dihapus')
}
</script>

<template>
  <article
    class="trip-card group relative isolate flex flex-col justify-end aspect-[3/2] overflow-hidden rounded-[22px] bg-ink text-white shadow-[0_14px_30px_-22px_rgba(16,38,43,.5)] transition-shadow duration-500 hover:shadow-[0_24px_48px_-16px_rgba(16,38,43,.45)]"
  >
    <!-- the photo fills the card; the category illustration stands in when there is none -->
    <img
      v-if="cover"
      :src="cover"
      alt=""
      loading="lazy"
      class="absolute inset-0 z-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.05] motion-reduce:group-hover:scale-100"
    >
    <CoreCover v-else :mat="trip.mat" :photo-size="0" class="!absolute inset-0 z-0" />
    <!-- dark at the bottom so the white text reads on any photo -->
    <div
      class="absolute inset-0 z-[1]"
      :style="{ background: cover
        ? 'linear-gradient(180deg,rgba(16,38,43,0) 22%,rgba(16,38,43,.58) 56%,rgba(16,38,43,.93) 100%)'
        : 'linear-gradient(180deg,rgba(16,38,43,.1) 0%,rgba(16,38,43,.72) 42%,rgba(16,38,43,.96) 100%)' }"
      aria-hidden="true"
    />

    <div class="z-[2] flex flex-col p-[16px] md:p-[18px]">
      <h3 class="font-display text-[22px] font-600 leading-[1.12] tracking-[-.01em] line-clamp-2 [text-shadow:0_1px_10px_rgba(16,38,43,.65)]">
        <NuxtLink
          :to="to"
          class="trip-card-link text-white hover:text-white outline-none after:absolute after:inset-0 after:z-[3] after:rounded-[22px]"
        >{{ trip.name }}</NuxtLink>
      </h3>
      <p class="text-[13px] text-white/90 mt-[4px] money [text-shadow:0_1px_10px_rgba(16,38,43,.65)]">{{ dateLine }}</p>

      <div class="flex items-end justify-between gap-3 mt-[12px]">
        <div class="min-w-0 [text-shadow:0_1px_10px_rgba(16,38,43,.65)]">
          <div class="text-[12px] text-white/85">{{ $t('app.card.plan') }}</div>
          <div class="money text-[18px] font-700 leading-tight truncate">{{ budget }}</div>
        </div>
        <!-- status as text, with a pill for the trip that is on right now -->
        <span
          class="shrink-0 text-[12.5px] font-600"
          :class="live ? 'bg-white text-teal-700 rounded-pill px-[10px] py-[4px] font-700' : 'text-white/85'"
        >{{ $t('status.' + trip.status) }}</span>
      </div>
    </div>

    <!-- "…" menu, above the stretched link -->
    <DropdownMenuRoot>
      <DropdownMenuTrigger
        class="absolute top-1 right-1 z-[4] w-11 h-11 flex items-center justify-center outline-none group/menu"
        :aria-label="`${$t('app.card.menu')}: ${trip.name}`"
      >
        <span class="w-8 h-8 rounded-full bg-ink/35 backdrop-blur-sm text-white flex items-center justify-center transition-colors duration-200 group-hover/menu:bg-ink/60 group-focus-visible/menu:ring-2 group-focus-visible/menu:ring-white group-data-[state=open]/menu:bg-ink/70">
          <i class="i-lucide-ellipsis text-[18px]" aria-hidden="true" />
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent align="end" :side-offset="4" class="z-[80] min-w-[180px] bg-white border border-sand-line2 rounded-card shadow-drop p-[6px]">
          <DropdownMenuItem
            class="flex items-center gap-2 px-[10px] py-[9px] min-h-[40px] rounded-[9px] text-[13.5px] text-ink cursor-pointer outline-none data-[highlighted]:bg-sand-100"
            @select="navigateTo(to)"
          >
            <i class="i-lucide-arrow-up-right text-[15px] text-teal-600" aria-hidden="true" /> {{ $t('app.hero.openTrip') }}
          </DropdownMenuItem>
          <DropdownMenuItem
            v-if="isOwner(trip)"
            class="flex items-center gap-2 px-[10px] py-[9px] min-h-[40px] rounded-[9px] text-[13.5px] text-warn-fg cursor-pointer outline-none data-[highlighted]:bg-warn-bg"
            @select="del"
          >
            <i class="i-lucide-trash-2 text-[15px]" aria-hidden="true" /> {{ $t('confirm.delTripCta') }}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  </article>
</template>

<style scoped>
/* keyboard focus: a ring around the whole card (white gap, then teal) so it reads on the pale page */
.trip-card:has(.trip-card-link:focus-visible) {
  box-shadow: 0 0 0 2px #fff, 0 0 0 5px #0e6e76, 0 24px 48px -16px rgba(16, 38, 43, 0.45);
}
</style>
