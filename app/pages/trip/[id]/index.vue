<script setup lang="ts">
// /trip/:id -> default to the overview tab
const route = useRoute()
await navigateTo(`/trip/${route.params.id}/overview`, { redirectCode: 302 })
</script>

<template>
  <div />
</template>
