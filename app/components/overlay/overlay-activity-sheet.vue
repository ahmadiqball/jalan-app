<script setup lang="ts">
import type { Activity, Trip } from '~/types/domain'
import { CATEGORIES } from '~/types/domain'
import { DUR_STEPS, durLabel, nearestDur, rp, initials } from '~/utils/format'
import { OF_SLOTS, tone, iconFor, ofText } from '~/utils/categories'
import { outfitFind, outfitDaySet } from '~/utils/derive'

const props = defineProps<{ trip: Trip }>()
const ui = useUiStore()
const trips = useTripsStore()
const { flash } = useToast()
const { searchUrl } = useMaps()

const found = computed(() => {
  for (let di = 0; di < props.trip.days.length; di++) {
    const a = props.trip.days[di]!.acts.find((x) => x.id === ui.activityId)
    if (a) return { act: a, dayIdx: di, day: props.trip.days[di]! }
  }
  return null
})
const open = computed({
  get: () => !!ui.activityId && !!found.value,
  set: (v: boolean) => { if (!v) ui.selectActivity(null) },
})

function set<K extends keyof Activity>(field: K, v: Activity[K]) {
  if (found.value) trips.setActivityField(props.trip.id, found.value.act.id, field, v)
}

const durModel = computed({
  get: () => String(nearestDur(found.value?.act.dur || 0)),
  set: (v: string) => set('dur', parseInt(v, 10)),
})
const durOptions = DUR_STEPS.map((m) => ({ value: String(m), label: durLabel(m) }))
const cats = [...CATEGORIES, 'Santai', 'Tempat']
const paid = computed({
  get: () => !!found.value?.act.paid,
  set: (v: boolean) => set('paid', v),
})

/* participants (undefined = everyone) */
const allIds = computed(() => props.trip.members.map((m) => m.id))
const selected = computed(() => found.value?.act.participants ?? allIds.value)
function toggleParticipant(id: string) {
  const cur = [...(found.value?.act.participants ?? allIds.value)]
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]
  if (!next.length) return
  set('participants', next.length === allIds.value.length ? undefined : next)
}

/* add a participant right here — just a name (no invite). Real invitations go
 * through the shareable link on the Anggota tab. */
const addingPerson = ref(false)
const newName = ref('')
function addPerson() {
  const name = newName.value.trim()
  if (!name) return
  const id = trips.addMember(props.trip.id, { name, email: '', role: 'Bisa ubah', status: 'aktif' })
  // only extend an explicit subset; "everyone" (undefined) already covers them
  if (found.value?.act.participants) set('participants', [...found.value.act.participants, id])
  newName.value = ''
  addingPerson.value = false
  flash(name + ' ditambahkan')
}
const splitCount = computed(() => Math.max(1, selected.value.length))
const costSub = computed(() => {
  const a = found.value?.act
  if (!a) return ''
  return a.cost ? `${splitCount.value} orang · ${rp(a.cost / splitCount.value)} per orang` : 'Aktivitas ini tidak masuk anggaran'
})

/* outfit — own act set editable, else fall back to day set */
const ownSet = computed(() => (found.value ? outfitFind(props.trip, 'act:' + found.value.act.id) : undefined))
const daySet = computed(() => (found.value ? outfitDaySet(props.trip, found.value.dayIdx) : null))
function setOutfitSlot(slot: 'top' | 'bottom' | 'shoes' | 'other', v: string) {
  if (ownSet.value) trips.setOutfitSlot(props.trip.id, ownSet.value.id, slot, v)
}
function makeOwnOutfit() {
  if (!found.value) return
  const base = daySet.value || undefined
  trips.addOutfitSet(props.trip.id, 'act:' + found.value.act.id, base ? { top: base.top, bottom: base.bottom, shoes: base.shoes, other: base.other } : undefined)
  flash(ofText(base) ? 'Disalin dari outfit hari ini, silakan ubah' : 'Set outfit aktivitas dibuat')
}
function dropOwnOutfit() {
  if (!found.value) return
  trips.removeOutfitScope(props.trip.id, 'act:' + found.value.act.id)
  flash('Aktivitas ini ikut outfit hari ini lagi')
}

const t = computed(() => (found.value ? tone(found.value.act.cat) : ['#F1EEE1', '#8A6314']))

function del() {
  if (!found.value) return
  trips.deleteActivity(props.trip.id, found.value.act.id)
  ui.selectActivity(null)
  flash('Aktivitas dihapus')
}
</script>

<template>
  <CoreDialog v-model:open="open" :width="520" title="Detail aktivitas">
    <div v-if="found" class="flex flex-col gap-4">
      <div class="flex items-center gap-3">
        <div class="w-[42px] h-[42px] rounded-[12px] flex items-center justify-center shrink-0" :style="{ background: t[0], color: t[1] }">
          <i :class="iconFor(found.act.cat)" class="text-[20px]" />
        </div>
        <div class="text-[12.5px] text-muted">{{ found.day.long }}</div>
      </div>

      <label class="flex flex-col gap-[6px]">
        <span class="eyebrow">Judul</span>
        <input :value="found.act.title" placeholder="Judul aktivitas" class="field !text-[16px] !font-600" @input="set('title', ($event.target as HTMLInputElement).value)">
      </label>

      <div class="grid grid-cols-2 gap-3">
        <div class="flex flex-col gap-[6px]">
          <span class="eyebrow">Jam</span>
          <CoreTimeInput :model-value="found.act.time" @update:model-value="set('time', $event)" />
        </div>
        <label class="flex flex-col gap-[6px]">
          <span class="eyebrow">Durasi</span>
          <CoreSelect v-model="durModel" :options="durOptions" />
        </label>
      </div>

      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-[6px]">
          <span class="eyebrow">Kategori</span>
          <CoreSelect :model-value="found.act.cat" :options="cats" @update:model-value="set('cat', $event)" />
        </label>
        <label class="flex flex-col gap-[6px]">
          <span class="eyebrow">Biaya</span>
          <CoreMoneyInput :model-value="found.act.cost" @update:model-value="set('cost', $event)" />
        </label>
      </div>
      <div class="text-[12.5px] text-muted -mt-2">{{ costSub }}</div>

      <label v-if="found.act.cost > 0" class="flex items-center justify-between gap-3 bg-paper rounded-field px-[13px] py-[11px] cursor-pointer">
        <div>
          <div class="text-[13.5px] font-600">Sudah dibayar</div>
          <div class="text-[12px] text-muted">{{ paid ? 'Dihitung sebagai pengeluaran' : 'Masih rencana — belum masuk terpakai' }}</div>
        </div>
        <CoreCheckbox :model-value="paid" @update:model-value="paid = $event" />
      </label>

      <div class="flex flex-col gap-[6px]">
        <div class="flex items-center justify-between">
          <span class="eyebrow">Tempat</span>
          <a
            v-if="found.act.place.trim()"
            :href="searchUrl({ name: found.act.place, placeId: found.act.placeId }, trip.place)"
            target="_blank"
            rel="noopener"
            class="text-[12px] font-600 text-teal-600 hover:text-teal-700 flex items-center gap-1"
          >
            <i class="i-lucide-map-pin text-[13px]" /> Buka di Maps
          </a>
        </div>
        <CorePlaceInput
          :model-value="found.act.place"
          :place-id="found.act.placeId"
          @update:model-value="set('place', $event)"
          @update:place-id="set('placeId', $event)"
        />
      </div>

      <!-- participants -->
      <div>
        <span class="eyebrow">Peserta</span>
        <div class="flex flex-wrap gap-2 mt-2">
          <button
            v-for="m in trip.members"
            :key="m.id"
            class="flex items-center gap-2 rounded-pill pl-[6px] pr-[12px] py-[5px] border transition-colors"
            :class="selected.includes(m.id) ? 'border-teal-600 bg-teal-100 text-teal-700' : 'border-sand-line text-muted hover:border-teal-600'"
            @click="toggleParticipant(m.id)"
          >
            <span class="w-[22px] h-[22px] rounded-full bg-white/70 flex items-center justify-center text-[10px] font-700">{{ initials(m.name) }}</span>
            <span class="text-[12.5px] font-600">{{ m.name.split(' ')[0] }}</span>
          </button>
          <button
            v-if="!addingPerson"
            class="flex items-center gap-1 rounded-pill px-[12px] py-[6px] border border-dashed border-sand-line3 text-muted text-[12.5px] font-600 hover:border-teal-600 hover:text-teal-700 transition-colors"
            @click="addingPerson = true"
          >
            <i class="i-lucide-user-plus text-[14px]" /> Tambah nama
          </button>
        </div>

        <div v-if="addingPerson" class="mt-3 flex items-center gap-2">
          <input v-model="newName" placeholder="Nama peserta" class="field !py-[9px] flex-1" @keydown.enter="addPerson">
          <CoreButton variant="teal" class="!px-[14px] !py-[9px] !text-[12.5px]" @click="addPerson">Tambah</CoreButton>
          <button class="text-[12.5px] font-600 text-muted px-1 hover:text-ink" @click="addingPerson = false">Batal</button>
        </div>
        <div v-if="addingPerson" class="text-[11.5px] text-muted mt-2">Cukup nama buat bagi biaya. Undang lewat link di tab Anggota.</div>
      </div>

      <label class="flex flex-col gap-[6px]">
        <span class="eyebrow">Catatan</span>
        <textarea :value="found.act.note" rows="3" placeholder="Tambah catatan…" class="field resize-none" @input="set('note', ($event.target as HTMLTextAreaElement).value)" />
      </label>

      <!-- outfit (editable) -->
      <div class="bg-paper rounded-card p-[14px_16px]">
        <div class="flex items-center justify-between mb-2">
          <span class="eyebrow">Outfit</span>
          <span class="rounded-pill px-[9px] py-[3px] text-[11px] font-700" :class="ownSet ? 'bg-sand-100 text-warn-fg2' : 'bg-teal-100 text-teal-700'">
            {{ ownSet ? 'Khusus aktivitas' : (ofText(daySet) ? 'Ikut outfit hari ini' : 'Belum diisi') }}
          </span>
        </div>

        <template v-if="ownSet">
          <div class="flex flex-col gap-2">
            <label v-for="[k, label, ph, icon] in OF_SLOTS" :key="k" class="flex items-center gap-2 bg-white rounded-field px-[12px] py-[8px]">
              <i :class="icon" class="text-[15px] text-teal-700 shrink-0" />
              <input :value="ownSet[k]" :placeholder="label + ', mis. ' + ph" class="flex-1 bg-transparent outline-none text-[13.5px] min-w-0" @input="setOutfitSlot(k, ($event.target as HTMLInputElement).value)">
            </label>
          </div>
          <button class="text-[12.5px] font-600 text-muted mt-2 hover:text-warn-fg" @click="dropOwnOutfit">Ikut outfit hari ini lagi</button>
        </template>
        <template v-else>
          <div v-if="ofText(daySet)" class="text-[13.5px] text-ink-2">{{ ofText(daySet) }}</div>
          <div v-else class="text-[13px] text-muted">Outfit hari ini belum diisi.</div>
          <button class="text-[12.5px] font-600 text-teal-600 mt-2" @click="makeOwnOutfit">+ Outfit khusus aktivitas</button>
        </template>
      </div>
    </div>

    <template #footer>
      <button class="text-warn-fg text-[13.5px] font-600 flex items-center gap-2 hover:underline" @click="del">
        <i class="i-lucide-trash-2 text-[15px]" /> Hapus aktivitas
      </button>
    </template>
  </CoreDialog>
</template>
