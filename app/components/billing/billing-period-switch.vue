<script setup lang="ts">
const period = defineModel<BillingPeriod>({ required: true })
const options: BillingPeriod[] = ['1m', '3m', '12m']
</script>

<template>
  <div class="bg-white border border-sand-line rounded-pill p-[5px] flex gap-1 w-fit">
    <button
      v-for="o in options"
      :key="o"
      class="rounded-pill px-[17px] py-[9px] text-[13px] font-700 whitespace-nowrap"
      :class="period === o ? 'bg-ink text-white' : 'text-ink-2'"
      @click="period = o"
    >
      {{ $t('billing.period.' + o) }}
    </button>
  </div>
</template>
