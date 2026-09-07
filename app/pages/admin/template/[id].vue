<script setup lang="ts">
import DaysTab from '~/components/days/days-tab.vue'
import BudgetTab from '~/components/budget/budget-tab.vue'
import PackingTab from '~/components/packing/packing-tab.vue'

useHead({ title: 'Template · Admin · Kelana' })
const route = useRoute()
const trips = useTripsStore()
const { flash } = useToast()
const { ensureLoaded, persist } = useTemplates()
const { apiFetch } = useApi()

// admin gate
const allowed = ref(!useIsCloud())
const checking = ref(true)
onMounted(async () => {
  if (useIsCloud()) {
    try { allowed.value = (await apiFetch<{ isAdmin: boolean }>('/api/me')).isAdmin } catch { allowed.value = false }
  }
  checking.value = false
  if (!allowed.value) navigateTo('/beranda')
})

const id = computed(() => String(route.params.id))
// make sure the template is loaded into the store before we read it
watchEffect(() => ensureLoaded())
const trip = computed(() => trips.byId(id.value))

const TABS = [['days', 'Hari'], ['budget', 'Anggaran'], ['packing', 'Barang']] as const
const tab = ref<'days' | 'budget' | 'packing'>('days')
const tabComp = computed(() => ({ days: DaysTab, budget: BudgetTab, packing: PackingTab }[tab.value]))

// header models write straight through to the template trip in the store
const nameModel = computed({ get: () => trip.value?.name || '', set: (v: string) => trips.updateTrip(id.value, { name: v }) })
const placeModel = computed(() => trip.value?.place || '')
function setPlace(v: string) { trips.updateTrip(id.value, { place: v }) }
function setPlaceId(v: string | undefined) { trips.updateTrip(id.value, { placeId: v }) }
function setMat(v: string) { trips.updateTrip(id.value, { mat: v }) }
function setCover(v: string) { trips.updateTrip(id.value, { cover: v }) }

const saving = ref(false)
async function save() {
  saving.value = true
  try { await persist(); flash('Template disimpan') } catch { flash('Gagal menyimpan') } finally { saving.value = false }
}
</script>

<template>
  <div class="flex-1 w-full max-w-[1400px] mx-auto p-[24px_20px_60px] md:p-[24px_32px_60px] anim-rise">
    <div v-if="checking" class="text-muted">Memeriksa akses…</div>
    <template v-else-if="allowed">
      <ClientOnly>
        <div v-if="trip" class="flex flex-col gap-5">
          <!-- header -->
          <div class="flex items-center gap-3">
            <NuxtLink to="/admin" class="w-[34px] h-[34px] shrink-0 rounded-full bg-paper border border-sand-line2 flex items-center justify-center hover:border-teal-600"><i class="i-lucide-chevron-left text-[17px] text-ink-2" /></NuxtLink>
            <div class="eyebrow">Template</div>
            <div class="ml-auto"><CoreButton variant="primary" :disabled="saving" @click="save">{{ saving ? 'Menyimpan…' : 'Simpan template' }}</CoreButton></div>
          </div>

          <div class="card p-[18px_20px] flex flex-col gap-4">
            <div class="flex flex-col gap-[6px]">
              <span class="eyebrow">Nama template</span>
              <input v-model="nameModel" class="field !text-[18px] !font-600" placeholder="mis. Sumba 4 hari">
            </div>
            <div class="flex flex-col gap-[6px]">
              <span class="eyebrow">Destinasi</span>
              <CorePlaceInput :model-value="placeModel" :place-id="trip.placeId" placeholder="Cari kota atau tempat…" @update:model-value="setPlace" @update:place-id="setPlaceId" />
            </div>
            <CoreCategoryPicker :mat="trip.mat" :cover="trip.cover || ''" editable-image @update:mat="setMat" @update:cover="setCover" />
          </div>

          <!-- restricted tabs -->
          <div class="flex gap-1 border-b border-sand-line">
            <button
              v-for="[key, label] in TABS"
              :key="key"
              class="px-4 pt-[10px] pb-[12px] text-[14px] border-b-[2.5px] transition-colors"
              :class="tab === key ? 'border-teal-600 text-ink font-700' : 'border-transparent text-muted font-500 hover:text-ink-2'"
              @click="tab = key"
            >
              {{ label }}
            </button>
          </div>

          <component :is="tabComp" :trip="trip" :template="tab === 'packing' ? undefined : true" />

          <!-- activity editor (Days tab opens this) -->
          <OverlayActivitySheet :trip="trip" />
        </div>
        <div v-else class="text-muted p-10 text-center">
          Template tidak ditemukan. <NuxtLink to="/admin" class="text-teal-600 font-600">Kembali</NuxtLink>
        </div>
        <template #fallback><SkeletonRows :count="5" /></template>
      </ClientOnly>
    </template>
  </div>
</template>
