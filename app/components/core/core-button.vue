<script setup lang="ts">
type Variant = 'primary' | 'teal' | 'ghost' | 'danger'

const props = withDefaults(
  defineProps<{
    variant?: Variant
    type?: 'button' | 'submit'
    block?: boolean
    disabled?: boolean
  }>(),
  { variant: 'primary', type: 'button', block: false, disabled: false },
)

const cls = computed(() => {
  const base: Record<Variant, string> = {
    primary: 'btn-primary',
    teal: 'btn-teal',
    ghost: 'btn-ghost',
    danger:
      'btn bg-warn-bg text-warn-fg px-[20px] py-[12px] text-[14px] hover:bg-[#f7d4bd]',
  }
  return cn(base[props.variant], props.block && 'w-full', props.disabled && 'opacity-55 pointer-events-none')
})
</script>

<template>
  <button :type="type" :class="cls" :disabled="disabled">
    <slot />
  </button>
</template>
