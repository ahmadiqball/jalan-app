<script setup lang="ts">
import DaysTab from '~/components/days/days-tab.vue'
import BudgetTab from '~/components/budget/budget-tab.vue'
import PackingTab from '~/components/packing/packing-tab.vue'

useHead({ title: 'Rute · Admin · Kelana' })
const route = useRoute()
const trips = useTripsStore()
const { flash } = useToast()
const { ensureLoaded, persist, setPublished, list } = useTemplates()
const { confirm } = useConfirm()
const { apiFetch } = useApi()

// admin gate
const allowed = ref(false)
const checking = ref(true)
onMounted(async () => {
  try { allowed.value = (await apiFetch<{ isAdmin: boolean }>('/api/me')).isAdmin } catch { allowed.value = false }
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

// legacy rows have no flag and are live
const isPublished = computed(() => trip.value?.published !== false)

// story-page fields (Rute Kelana)
type StoryKey = 'slug' | 'intro' | 'goodFor' | 'bestTime' | 'budgetNote' | 'coverCredit' | 'coverSource'
function storyModel(k: StoryKey) {
  return computed({
    get: () => trip.value?.story?.[k] || '',
    set: (v: string) => trips.updateTrip(id.value, { story: { ...(trip.value?.story || {}), [k]: v } }),
  })
}
const introModel = storyModel('intro')
const goodForModel = storyModel('goodFor')
const bestTimeModel = storyModel('bestTime')
const slugModel = storyModel('slug')
const budgetNoteModel = storyModel('budgetNote')
const coverCreditModel = storyModel('coverCredit')
const coverSourceModel = storyModel('coverSource')
// "Kenapa susunannya begini": edited as lines; the raw text stays local so Enter can start a new point
const reasonsText = ref('')
watch(() => trip.value?.id, () => { reasonsText.value = (trip.value?.story?.reasons || []).join('\n') }, { immediate: true })
function setReasons(v: string) {
  reasonsText.value = v
  const reasons = v.split('\n').map((s) => s.trim()).filter(Boolean)
  trips.updateTrip(id.value, { story: { ...(trip.value?.story || {}), reasons } })
}
/** fill an empty slug from the name, and keep it URL-safe and unique */
function settleSlug() {
  if (!trip.value) return
  const raw = trip.value.story?.slug || trip.value.name
  slugModel.value = uniqueSlug(raw, id.value, list.value)
}

const saving = ref(false)
async function save() {
  settleSlug()
  saving.value = true
  try { await persist(id.value); flash(isPublished.value ? 'Perubahan tayang' : 'Draf disimpan') } catch { flash('Gagal menyimpan') } finally { saving.value = false }
}

async function publish() {
  const ok = await confirm({
    title: 'Tayangkan rute ini?',
    message: `"${trip.value?.name || 'Rute ini'}" akan langsung terlihat oleh semua pengguna di Rute Kelana.`,
    confirmLabel: 'Tayangkan',
  })
  if (!ok) return
  settleSlug()
  saving.value = true
  try { await setPublished(id.value, true); flash('Rute ditayangkan') } catch { flash('Gagal menayangkan') } finally { saving.value = false }
}

async function unpublish() {
  const ok = await confirm({
    title: 'Jadikan draf?',
    message: 'Rute ini akan disembunyikan dari pengguna. Trip yang sudah dibuat dari rute ini tidak terpengaruh.',
    confirmLabel: 'Jadikan draf',
  })
  if (!ok) return
  saving.value = true
  try { await setPublished(id.value, false); flash('Rute dijadikan draf') } catch { flash('Gagal mengubah status') } finally { saving.value = false }
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
            <div class="eyebrow">Rute Kelana</div>
            <AdminPublishBadge :published="isPublished" />
            <div class="ml-auto flex items-center gap-2 flex-wrap justify-end">
              <template v-if="isPublished">
                <CoreButton variant="ghost" :disabled="saving" @click="unpublish">Jadikan draf</CoreButton>
                <CoreButton variant="primary" :disabled="saving" @click="save">{{ saving ? 'Menyimpan…' : 'Simpan perubahan' }}</CoreButton>
              </template>
              <template v-else>
                <CoreButton variant="ghost" :disabled="saving" @click="save">{{ saving ? 'Menyimpan…' : 'Simpan draf' }}</CoreButton>
                <CoreButton variant="primary" :disabled="saving" @click="publish"><i class="i-lucide-eye text-[15px]" aria-hidden="true" /> Tayangkan</CoreButton>
              </template>
            </div>
          </div>
          <p class="text-[12.5px] text-muted -mt-2 md:text-right" role="status">
            {{ isPublished ? 'Rute ini terlihat oleh pengguna. Perubahan yang disimpan langsung tayang.' : 'Draf hanya terlihat di admin. Tayangkan kalau rute sudah siap.' }}
          </p>

          <div class="card p-[18px_20px] flex flex-col gap-4">
            <div class="flex flex-col gap-[6px]">
              <span class="eyebrow">Nama rute</span>
              <input v-model="nameModel" class="field !text-[18px] !font-600" placeholder="mis. Sumba 4 hari">
            </div>
            <div class="flex flex-col gap-[6px]">
              <span class="eyebrow">Destinasi</span>
              <CorePlaceInput :model-value="placeModel" :place-id="trip.placeId" placeholder="Cari kota atau tempat…" @update:model-value="setPlace" @update:place-id="setPlaceId" />
            </div>
            <CoreCategoryPicker :mat="trip.mat" :cover="trip.cover || ''" editable-image @update:mat="setMat" @update:cover="setCover" />
            <div v-if="trip.cover" class="grid gap-2 sm:grid-cols-2">
              <input v-model="coverCreditModel" class="field !py-[9px] !text-[13px]" placeholder="Kredit foto cover, mis. Nama, CC BY-SA 4.0">
              <input v-model="coverSourceModel" class="field !py-[9px] !text-[13px] money" placeholder="Link sumber foto (opsional)">
            </div>
          </div>

          <!-- story page content -->
          <div class="card p-[18px_20px] flex flex-col gap-4">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div class="font-display text-[18px] font-600">Halaman cerita</div>
                <div class="text-[12.5px] text-muted mt-[2px]">Alasan dan tips per aktivitas diisi di tab Hari, lewat tiap aktivitas.</div>
              </div>
              <a :href="`/rute/${routeSlug(trip)}`" target="_blank" rel="noopener" class="text-[13px] font-600 text-teal-600 hover:text-teal-700 flex items-center gap-1 min-h-[44px]"><i class="i-lucide-external-link text-[14px]" aria-hidden="true" /> Pratinjau</a>
            </div>
            <label class="flex flex-col gap-[6px]">
              <span class="eyebrow">Kenapa rute ini</span>
              <textarea v-model="introModel" rows="3" class="field resize-none" placeholder="2–3 kalimat: untuk siapa rute ini, dan apa yang membuatnya istimewa." />
            </label>
            <label class="flex flex-col gap-[6px]">
              <span class="eyebrow">Kenapa susunannya begini</span>
              <textarea
                :value="reasonsText"
                rows="4"
                class="field resize-none"
                placeholder="Satu alasan per baris, mis.&#10;Gili dulu, selagi badan segar dan laut paling tenang&#10;Rinjani di tengah, supaya ada 2 hari santai sesudahnya&#10;Hari terakhir di Kuta, 30 menit dari bandara"
                @input="setReasons(($event.target as HTMLTextAreaElement).value)"
              />
              <span class="text-[12px] text-muted">Alasan memilih rute ini daripada menyusun sendiri. Tampil tepat setelah "Kenapa rute ini".</span>
            </label>
            <div class="grid gap-4 md:grid-cols-2">
              <label class="flex flex-col gap-[6px]">
                <span class="eyebrow">Cocok untuk</span>
                <input v-model="goodForModel" class="field" placeholder="mis. Pasangan, teman">
              </label>
              <label class="flex flex-col gap-[6px]">
                <span class="eyebrow">Waktu terbaik</span>
                <input v-model="bestTimeModel" class="field" placeholder="mis. Mei–Sep">
              </label>
            </div>
            <label class="flex flex-col gap-[6px]">
              <span class="eyebrow">Catatan anggaran</span>
              <input v-model="budgetNoteModel" class="field" :placeholder="DEFAULT_BUDGET_NOTE">
              <span class="text-[12px] text-muted">Yang tidak termasuk di perkiraan anggaran. Kalau dikosongkan, tampil "{{ DEFAULT_BUDGET_NOTE }}"</span>
            </label>
            <label class="flex flex-col gap-[6px]">
              <span class="eyebrow">Alamat halaman</span>
              <div class="flex items-center gap-2">
                <span class="text-[13.5px] text-muted money shrink-0">/rute/</span>
                <input v-model="slugModel" class="field" :placeholder="slugify(trip.name) || 'nama-rute'" @blur="settleSlug">
              </div>
              <span class="text-[12px] text-muted">Terisi otomatis dari nama rute saat disimpan. Kalau diganti setelah tayang, link lama tidak berlaku lagi.</span>
            </label>
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
          Rute tidak ditemukan. <NuxtLink to="/admin" class="text-teal-600 font-600">Kembali</NuxtLink>
        </div>
        <template #fallback><SkeletonRows :count="5" /></template>
      </ClientOnly>
    </template>
  </div>
</template>
