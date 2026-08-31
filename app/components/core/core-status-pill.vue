<script setup lang="ts">
import type { TripStatus } from '~/types/domain'

const props = defineProps<{ status: TripStatus }>()

const MAP: Record<TripStatus, { cls: string; label: string }> = {
  live: { cls: 'status-live', label: 'Sedang jalan' },
  plan: { cls: 'status-plan', label: 'Rencana' },
  draft: { cls: 'status-draft', label: 'Draf' },
}
const it = computed(() => MAP[props.status])
</script>

<template>
  <span :class="it.cls">{{ it.label }}</span>
</template>
