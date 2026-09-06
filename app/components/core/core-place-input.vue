<script setup lang="ts">
import type { PlacePrediction } from '~/composables/use-places'

/**
 * Location field backed by Google Places autocomplete. The user types and
 * picks a real place; we store its name + place_id. With no Maps key it
 * degrades to a plain text field (place_id stays empty).
 */
const props = withDefaults(
  defineProps<{
    modelValue: string
    placeId?: string
    placeholder?: string
  }>(),
  { placeholder: 'Cari tempat…' },
)
const emit = defineEmits<{
  'update:modelValue': [string]
  'update:placeId': [string | undefined]
}>()

const { enabled, newToken, suggest } = usePlaces()
const open = ref(false)
const loading = ref(false)
const items = ref<PlacePrediction[]>([])
let token: unknown = null
let timer: ReturnType<typeof setTimeout> | undefined

function onInput(e: Event) {
  const v = (e.target as HTMLInputElement).value
  emit('update:modelValue', v)
  emit('update:placeId', undefined) // editing invalidates a previous pick
  if (!enabled.value) return
  clearTimeout(timer)
  timer = setTimeout(() => run(v), 250)
}

async function run(v: string) {
  if (!v.trim()) { items.value = []; open.value = false; return }
  loading.value = true
  try {
    if (!token) token = await newToken()
    items.value = await suggest(v, token)
    open.value = items.value.length > 0
  } finally {
    loading.value = false
  }
}

function choose(it: PlacePrediction) {
  emit('update:modelValue', it.name)
  emit('update:placeId', it.placeId)
  open.value = false
  items.value = []
  token = null // pick ends the session
}
function onBlur() {
  setTimeout(() => (open.value = false), 150) // let a click land first
}
</script>

<template>
  <div class="relative">
    <input
      :value="modelValue"
      :placeholder="enabled ? placeholder : 'Belum ada tempat'"
      class="field"
      autocomplete="off"
      @input="onInput"
      @focus="items.length && (open = true)"
      @blur="onBlur"
    >
    <i v-if="loading" class="i-lucide-loader-circle animate-spin absolute right-[12px] top-1/2 -translate-y-1/2 text-[15px] text-muted" />

    <div
      v-if="open && items.length"
      class="absolute left-0 right-0 top-[calc(100%+4px)] z-[75] bg-white border border-sand-line2 rounded-field shadow-drop p-[6px] max-h-[240px] overflow-y-auto"
    >
      <button
        v-for="it in items"
        :key="it.placeId"
        class="w-full text-left flex items-center gap-2 px-[10px] py-[8px] rounded-[9px] hover:bg-sand-100"
        @mousedown.prevent="choose(it)"
      >
        <i class="i-lucide-map-pin text-[14px] text-teal-600 shrink-0" />
        <span class="text-[13.5px] truncate">{{ it.name }}</span>
      </button>
    </div>

    <div v-if="enabled && placeId" class="text-[11.5px] text-teal-700 mt-1 flex items-center gap-1">
      <i class="i-lucide-check text-[12px]" /> Lokasi terpilih
    </div>
    <div v-else-if="enabled && modelValue.trim()" class="text-[11.5px] text-muted mt-1">
      Pilih dari daftar biar lokasinya pasti di peta.
    </div>
  </div>
</template>
