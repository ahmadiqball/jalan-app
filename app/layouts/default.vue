<template>
  <div class="min-h-screen flex flex-col bg-paper">
    <LayoutTopBar />
    <div class="flex-1 flex flex-col">
      <slot />
    </div>
    <CoreToast />
    <CoreConfirm />
  </div>
</template>
