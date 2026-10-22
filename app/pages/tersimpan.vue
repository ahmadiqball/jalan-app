<script setup lang="ts">
useHead({ title: 'Tersimpan · Kelana' })
const localePath = useLocalePath()
const { data, refresh } = useSaved()
onMounted(refresh)

const empty = computed(() => !data.value.guides.length && !data.value.places.length)
</script>

<template>
  <div class="flex-1 w-full max-w-[1100px] mx-auto p-[30px_20px_64px] md:p-[30px_32px_72px] flex flex-col gap-7 anim-rise">
    <div>
      <div class="font-display text-[clamp(26px,5vw,34px)] font-700">Tersimpan</div>
      <div class="text-[13.5px] text-muted mt-[4px]">Panduan dan tempat yang kamu simpan.</div>
    </div>

    <ClientOnly>
      <div v-if="empty" class="card p-12 text-center flex flex-col items-center gap-3">
        <div class="w-[48px] h-[48px] rounded-full bg-sand-100 flex items-center justify-center"><i class="i-lucide-bookmark text-[22px] text-muted" /></div>
        <div class="text-[14.5px] font-600">Belum ada yang disimpan</div>
        <div class="text-[13px] text-muted max-w-[340px]">Ketuk “Simpan” di panduan atau tempat untuk menyimpannya di sini.</div>
        <NuxtLink :to="localePath('/guides')" class="mt-1"><CoreButton variant="primary">Jelajahi Guides</CoreButton></NuxtLink>
      </div>

      <template v-else>
        <section v-if="data.guides.length">
          <div class="font-display text-[20px] font-600 mb-3">Panduan</div>
          <div class="grid gap-[18px]" style="grid-template-columns:repeat(auto-fill,minmax(min(300px,100%),1fr))">
            <GuideDestinationCard v-for="d in data.guides" :key="d.id" :destination="d" />
          </div>
        </section>

        <section v-if="data.places.length">
          <div class="font-display text-[20px] font-600 mb-3">Tempat</div>
          <div class="grid gap-[16px]" style="grid-template-columns:repeat(auto-fill,minmax(min(270px,100%),1fr))">
            <GuidePlaceCard v-for="p in data.places" :key="p.id" :place="p" :slug="p.destinationSlug || ''" />
          </div>
        </section>
      </template>

      <template #fallback><SkeletonCards :count="3" /></template>
    </ClientOnly>
  </div>
</template>
