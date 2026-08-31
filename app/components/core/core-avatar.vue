<script setup lang="ts">
import { initials as toInitials } from '~/utils/format'

const props = withDefaults(
  defineProps<{ name?: string; size?: number; photo?: string }>(),
  { name: '', size: 40 },
)
const label = computed(() => (props.name ? toInitials(props.name) : ''))
const style = computed(() => ({
  width: props.size + 'px',
  height: props.size + 'px',
  fontSize: Math.round(props.size * 0.34) + 'px',
  ...(props.photo ? { backgroundImage: `url('${props.photo}')`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}),
}))
</script>

<template>
  <div
    class="rounded-full bg-sand-100 text-ink-2 font-700 flex items-center justify-center shrink-0 overflow-hidden"
    :style="style"
  >
    <span v-if="!photo">{{ label }}</span>
  </div>
</template>
