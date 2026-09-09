<script setup lang="ts">
const { current, resolve } = useConfirm()
const { t } = useI18n()

const open = computed({
  get: () => !!current.value,
  set: (v: boolean) => { if (!v) resolve(false) },
})
</script>

<template>
  <CoreDialog :open="open" side="center" :width="440" :title="current?.title || ''" @update:open="open = $event">
    <p v-if="current?.message" class="text-[14px] text-ink-2 leading-[1.55]">{{ current.message }}</p>
    <template #footer>
      <div class="flex justify-end gap-2">
        <CoreButton variant="ghost" @click="resolve(false)">{{ current?.cancelLabel || t('confirm.cancel') }}</CoreButton>
        <CoreButton :variant="current?.danger ? 'danger' : 'primary'" @click="resolve(true)">
          {{ current?.confirmLabel || t('confirm.ok') }}
        </CoreButton>
      </div>
    </template>
  </CoreDialog>
</template>
