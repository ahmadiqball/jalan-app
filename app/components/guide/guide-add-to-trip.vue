<script setup lang="ts">
import { placeTypeToCat, placeTypeLabel, placeTypeIcon } from '~/utils/guide'
import { tone } from '~/utils/categories'

const { place, close } = useAddToTrip()
const trips = useTripsStore()
const session = useSessionStore()
const { flash } = useToast()
const { canEdit } = useTripAccess()
const localePath = useLocalePath()
const route = useRoute()

const open = computed({ get: () => !!place.value, set: (v: boolean) => { if (!v) close() } })

const editableTrips = computed(() => trips.userTrips.filter((t) => canEdit(t)))
const selectedTripId = ref('')
const selectedDay = ref(0)
const time = ref('')
const note = ref('')

const selectedTrip = computed(() => trips.byId(selectedTripId.value))
const tripOptions = computed(() => editableTrips.value.map((t) => ({ value: t.id, label: t.name })))

// reset the form each time the modal opens
watch(place, (p) => {
  if (!p) return
  selectedTripId.value = editableTrips.value[0]?.id || ''
  selectedDay.value = 0
  time.value = ''
  note.value = ''
})

function confirm() {
  const p = place.value
  if (!p || !selectedTripId.value) return
  trips.addActivity(selectedTripId.value, selectedDay.value, {
    time: time.value,
    title: p.name,
    cat: placeTypeToCat(p.type),
    place: p.area ? `${p.name}, ${p.area}` : p.name,
    cost: 0,
    dur: 60,
    note: note.value.trim(),
  })
  const dayLabel = selectedTrip.value?.days[selectedDay.value]?.date || 'trip'
  flash(`"${p.name}" ditambahkan ke ${dayLabel}`)
  close()
}

const loginLink = computed(() => localePath(`/masuk?next=${encodeURIComponent(route.fullPath)}`))
</script>

<template>
  <CoreDialog v-if="place" v-model:open="open" side="center" :width="440" title="Tambahkan ke trip saya">
    <div class="flex flex-col gap-4">
      <!-- place summary -->
      <div class="flex items-center gap-3 bg-paper rounded-field p-[11px_13px]">
        <div
          class="w-[44px] h-[44px] rounded-[11px] bg-cover bg-center shrink-0 flex items-center justify-center"
          :style="place.gallery && place.gallery[0] ? { backgroundImage: `url('${place.gallery[0]}')` } : { background: tone(placeTypeToCat(place.type))[0] }"
        >
          <i v-if="!(place.gallery && place.gallery[0])" :class="placeTypeIcon(place.type)" class="text-[20px]" :style="{ color: tone(placeTypeToCat(place.type))[1] }" />
        </div>
        <div class="min-w-0">
          <div class="font-600 text-[14.5px] truncate">{{ place.name }}</div>
          <div class="text-[12.5px] text-muted truncate">{{ placeTypeLabel(place.type) }}<span v-if="place.area"> · {{ place.area }}</span></div>
        </div>
      </div>

      <!-- not signed in -->
      <div v-if="!session.authed" class="flex flex-col gap-3 items-center text-center py-2">
        <div class="text-[13.5px] text-ink-2">Masuk dulu untuk menambahkan tempat ke trip kamu.</div>
        <NuxtLink :to="loginLink" @click="close"><CoreButton variant="primary">Masuk</CoreButton></NuxtLink>
      </div>

      <!-- no editable trips -->
      <div v-else-if="!editableTrips.length" class="flex flex-col gap-3 items-center text-center py-2">
        <div class="text-[13.5px] text-ink-2">Kamu belum punya trip yang bisa diubah. Buat trip dulu.</div>
        <NuxtLink :to="localePath('/beranda')" @click="close"><CoreButton variant="primary">Ke beranda</CoreButton></NuxtLink>
      </div>

      <template v-else>
        <!-- 1 · trip -->
        <label class="flex flex-col gap-[7px]">
          <span class="text-[12.5px] font-600 text-ink-2">1 · Pilih trip</span>
          <CoreSelect v-model="selectedTripId" :options="tripOptions" />
        </label>

        <!-- 2 · day -->
        <div v-if="selectedTrip" class="flex flex-col gap-[7px]">
          <span class="text-[12.5px] font-600 text-ink-2">2 · Pilih hari</span>
          <div class="flex flex-col gap-[6px] max-h-[220px] overflow-y-auto">
            <button
              v-for="(d, i) in selectedTrip.days"
              :key="i"
              class="flex items-center gap-3 rounded-field border px-[13px] py-[10px] text-left transition-colors"
              :class="selectedDay === i ? 'border-teal-600 bg-teal-100' : 'border-sand-line2 hover:border-teal-600'"
              @click="selectedDay = i"
            >
              <span class="w-[16px] h-[16px] rounded-full border-[2px] shrink-0 flex items-center justify-center" :class="selectedDay === i ? 'border-teal-600' : 'border-sand-line3'">
                <span v-if="selectedDay === i" class="w-[8px] h-[8px] rounded-full bg-teal-600" />
              </span>
              <span class="flex-1 min-w-0">
                <span class="block money text-[11.5px] text-muted leading-none">{{ d.date }}</span>
                <span class="block text-[13.5px] font-600 truncate">{{ d.title && d.title !== 'Belum diberi nama' ? d.title : 'Hari ' + (i + 1) }}</span>
              </span>
              <span class="text-[11.5px] text-muted shrink-0">{{ d.acts.length }} aktivitas</span>
            </button>
          </div>
        </div>

        <!-- 3 · time + note -->
        <div class="grid grid-cols-2 gap-3 items-end">
          <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Jam (opsional)</span><CoreTimeInput v-model="time" /></label>
          <label class="flex flex-col gap-[7px]"><span class="text-[12.5px] font-600 text-ink-2">Catatan (opsional)</span><input v-model="note" placeholder="mis. request kamar" class="field !py-[9px]"></label>
        </div>
      </template>
    </div>

    <template v-if="session.authed && editableTrips.length" #footer>
      <div class="flex justify-end gap-3">
        <CoreButton variant="ghost" class="!px-[16px] !py-[10px] !text-[13.5px]" @click="close">Batal</CoreButton>
        <CoreButton variant="primary" class="!px-[18px] !py-[10px] !text-[13.5px]" :disabled="!selectedTripId" @click="confirm">
          Tambahkan
        </CoreButton>
      </div>
    </template>
  </CoreDialog>
</template>
