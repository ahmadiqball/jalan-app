<script setup lang="ts">
const ui = useUiStore()
</script>

<template>
  <Transition
    enter-active-class="anim-toast"
    leave-active-class="transition-opacity duration-200"
    leave-to-class="opacity-0"
  >
    <div
      v-if="ui.toast"
      role="status"
      aria-live="polite"
      class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-ink text-white rounded-pill px-5 py-3 text-[13.5px] font-600 shadow-[0_18px_40px_-20px_rgba(16,38,43,.6)]"
    >
      {{ ui.toast }}
    </div>
  </Transition>
</template>
