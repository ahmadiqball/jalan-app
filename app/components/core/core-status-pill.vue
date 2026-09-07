<script setup lang="ts">
import type { TripStatus } from '~/types/domain'

const props = defineProps<{ status: TripStatus }>()
const { t } = useI18n()

const CLS: Record<TripStatus, string> = {
  live: 'status-live',
  plan: 'status-plan',
  draft: 'status-draft',
  template: 'status-plan',
}
</script>

<template>
  <span :class="CLS[status]">{{ t('status.' + status) }}</span>
</template>
