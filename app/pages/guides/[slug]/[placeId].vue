<script setup lang="ts">
import type { PlaceDetail } from '~/types/guide'
import { placeTypeLabel, placeTypeIcon, placeTypeToCat } from '~/utils/guide'
import { tone } from '~/utils/categories'

definePageMeta({ public: true })
const route = useRoute()
const localePath = useLocalePath()
const { searchUrl } = useMaps()
const { open: addToTrip } = useAddToTrip()
const session = useSessionStore()
const { isSaved, toggle, refresh: refreshSaved } = useSaved()
const placeId = computed(() => route.params.placeId as string)
onMounted(refreshSaved)

const { data: place, error, status } = useFetch<PlaceDetail>(() => `/api/places/${placeId.value}`, { key: `place-${placeId.value}`, lazy: true, getCachedData: payloadCache })
useHead(() => ({ title: (place.value?.name ?? 'Tempat') + ' · Kelana Guides' }))

const gallery = computed(() => (place.value?.gallery ?? []).slice(0, 5))
const mainImg = ref(0)
watch(() => place.value?.id, () => { mainImg.value = 0 })
const mapHref = computed(() => (place.value ? searchUrl({ name: place.value.name, placeId: place.value.gmapsPlaceId }, place.value.destination.name) : '#'))

const saved = computed(() => (place.value ? isSaved('place', place.value.id) : false))
function onSave() {
  if (!place.value) return
  if (!session.authed) return navigateTo(localePath(`/masuk?next=${encodeURIComponent(route.fullPath)}`))
  toggle('place', place.value.id)
}
</script>

<template>
  <div class="flex-1 w-full anim-rise">
    <div v-if="status === 'pending' && !place" class="max-w-[1000px] mx-auto p-[20px_20px_64px] md:p-[26px_32px_72px] flex flex-col gap-5">
      <CoreSkeleton class="h-[240px] md:h-[340px] w-full" rounded="rounded-card" />
      <CoreSkeleton class="h-8 w-1/2" />
      <CoreSkeleton class="h-4 w-2/3" />
      <SkeletonRows :count="3" />
    </div>
    <div v-else-if="error || !place" class="max-w-[700px] mx-auto p-16 text-center text-muted">
      Tempat tidak ditemukan. <NuxtLink :to="localePath('/guides')" class="text-teal-600 font-600">Kembali ke Guides</NuxtLink>
    </div>

    <div v-else class="max-w-[1000px] mx-auto p-[20px_20px_64px] md:p-[26px_32px_72px] flex flex-col gap-5">
      <NuxtLink :to="localePath(`/guides/${place.destination.slug}`)" class="inline-flex items-center gap-1 text-[13px] font-600 text-muted hover:text-teal-700 w-fit"><i class="i-lucide-chevron-left text-[16px]" /> Kembali ke {{ place.destination.name }}</NuxtLink>

      <!-- gallery carousel (max 5) -->
      <div v-if="gallery.length" class="relative rounded-card overflow-hidden h-[240px] md:h-[380px] bg-sand-100">
        <div class="w-full h-full bg-cover bg-center" :style="{ backgroundImage: `url('${gallery[Math.min(mainImg, gallery.length - 1)]}')` }" />
        <template v-if="gallery.length > 1">
          <button type="button" class="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-ink-2 hover:bg-white" @click="mainImg = (mainImg - 1 + gallery.length) % gallery.length"><i class="i-lucide-chevron-left text-[20px]" /></button>
          <button type="button" class="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center text-ink-2 hover:bg-white" @click="mainImg = (mainImg + 1) % gallery.length"><i class="i-lucide-chevron-right text-[20px]" /></button>
          <div class="absolute top-3 right-3 rounded-pill bg-black/45 text-white text-[11.5px] font-700 px-[9px] py-[3px] money">{{ (mainImg % gallery.length) + 1 }}/{{ gallery.length }}</div>
          <div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-[6px]">
            <button v-for="(g, i) in gallery" :key="i" type="button" class="h-[7px] rounded-full transition-all" :class="i === mainImg ? 'bg-white w-[20px]' : 'bg-white/60 w-[7px]'" @click="mainImg = i" />
          </div>
        </template>
      </div>
      <div v-else class="h-[220px] md:h-[300px] rounded-card flex items-center justify-center" :style="{ background: tone(placeTypeToCat(place.type))[0] }">
        <i :class="placeTypeIcon(place.type)" class="text-[56px]" :style="{ color: tone(placeTypeToCat(place.type))[1] }" />
      </div>

      <!-- title + actions -->
      <div class="flex items-start justify-between gap-4 flex-wrap">
        <div class="min-w-0">
          <h1 class="font-display text-[clamp(24px,4vw,32px)] font-700 leading-tight">{{ place.name }}</h1>
          <div class="flex items-center gap-[7px] text-[13.5px] text-ink-2 mt-1"><i class="i-lucide-map-pin text-[15px] text-teal-700" /> {{ place.area || place.destination.name }}</div>
        </div>
        <div class="flex gap-2 shrink-0">
          <CoreButton variant="ghost" class="!px-[15px] !py-[10px] !text-[13.5px]" :class="saved ? '!text-teal-700 !border-teal-600' : ''" @click="onSave"><i :class="saved ? 'i-lucide-bookmark-check' : 'i-lucide-bookmark'" class="text-[15px]" /> {{ saved ? 'Tersimpan' : 'Simpan' }}</CoreButton>
          <CoreButton variant="primary" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="addToTrip(place)"><i class="i-lucide-plus text-[15px]" /> Tambah ke trip</CoreButton>
        </div>
      </div>

      <!-- tags -->
      <div v-if="place.tags?.length" class="flex gap-[7px] flex-wrap">
        <span class="inline-flex items-center gap-1 rounded-pill bg-teal-100 text-teal-700 px-[11px] py-[5px] text-[12px] font-700"><i :class="placeTypeIcon(place.type)" class="text-[12px]" /> {{ placeTypeLabel(place.type) }}</span>
        <span v-for="t in place.tags" :key="t" class="rounded-pill bg-paper text-ink-2 px-[11px] py-[5px] text-[12px] font-600">{{ t }}</span>
      </div>

      <!-- info row -->
      <div class="grid gap-3" style="grid-template-columns:repeat(auto-fit,minmax(min(180px,100%),1fr))">
        <div v-if="place.priceText" class="card p-[14px_16px] flex items-center gap-3"><i class="i-lucide-tag text-[18px] text-teal-700" /><div><div class="money text-[15px] font-700">{{ place.priceText }}</div><div class="text-[12px] text-muted">perkiraan harga</div></div></div>
        <div v-if="place.openHours" class="card p-[14px_16px] flex items-center gap-3"><i class="i-lucide-clock text-[18px] text-teal-700" /><div><div class="text-[14px] font-600">{{ place.openHours }}</div><div class="text-[12px] text-muted">jam buka</div></div></div>
      </div>

      <div class="grid gap-5 md:grid-cols-[1.6fr_1fr]">
        <div class="flex flex-col gap-5">
          <!-- tentang -->
          <div v-if="place.longDesc || place.shortDesc">
            <div class="font-display text-[19px] font-600 mb-2">Tentang</div>
            <p class="text-[14px] text-ink-2 leading-[1.6]">{{ place.longDesc || place.shortDesc }}</p>
          </div>
          <!-- good to know -->
          <div v-if="place.goodToKnow?.length" class="card p-[16px_18px]">
            <div class="flex items-center gap-2 mb-2"><i class="i-lucide-lightbulb text-warn-fg text-[17px]" /><div class="font-display text-[16px] font-600">Good to Know</div></div>
            <div class="flex flex-col gap-[9px] mt-1">
              <div v-for="(g, i) in place.goodToKnow" :key="i" class="flex items-start gap-[10px] text-[13.5px] text-ink-2"><i class="i-lucide-check-circle-2 text-teal-600 text-[16px] shrink-0 mt-[1px]" /> <span>{{ g }}</span></div>
            </div>
          </div>
          <!-- tips -->
          <div v-if="place.tips?.length" class="card p-[16px_18px]">
            <div class="font-display text-[16px] font-600 mb-2">Tips</div>
            <div class="flex flex-col gap-[9px]">
              <div v-for="(t, i) in place.tips" :key="i" class="flex items-start gap-[10px] text-[13.5px] text-ink-2"><i class="i-lucide-dot text-teal-600 text-[16px] shrink-0" /> <span>{{ t }}</span></div>
            </div>
          </div>
        </div>

        <!-- map -->
        <div class="card p-[16px_18px] h-fit md:sticky md:top-[84px]">
          <div class="font-display text-[15px] font-600 mb-1">Lokasi</div>
          <div class="text-[13px] text-ink-2 line-clamp-2 break-words" :title="place.area || place.destination.name">{{ place.area || place.destination.name }}</div>
          <a :href="mapHref" target="_blank" rel="noopener" class="mt-3 block"><CoreButton variant="ghost" block class="!py-[11px] !text-[13.5px]"><i class="i-lucide-map text-[15px]" /> Lihat di Maps</CoreButton></a>
          <a v-if="place.url" :href="place.url" target="_blank" rel="noopener" class="mt-2 block"><CoreButton variant="ghost" block class="!py-[11px] !text-[13.5px]"><i class="i-lucide-external-link text-[15px]" /> Situs</CoreButton></a>
        </div>
      </div>
    </div>
  </div>
</template>
