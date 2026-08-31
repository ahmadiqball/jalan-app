<script setup lang="ts">
// Phase 0 smoke page — verifies UnoCSS tokens/shortcuts, Lucide icons,
// Reka UI (Dialog), fonts, and Pinia persistence all wire together.
// This will be replaced by the real landing page in Phase 5.
const ui = useUiStore()
</script>

<template>
  <main class="min-h-screen flex flex-col items-center justify-center gap-8 px-6 py-16">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-[10px] bg-teal-600 relative overflow-hidden">
        <span class="absolute left-[6px] top-[7px] w-[9px] h-[9px] rounded-full bg-sand-100" />
        <span class="absolute left-[-2px] bottom-[9px] w-[25px] h-[14px] rounded-t-[14px] bg-brand-green" />
        <span class="absolute left-[7px] bottom-0 w-[29px] h-[9px] rounded-t-[11px] bg-brand-orange" />
      </div>
      <h1 class="font-display text-[34px] font-600 text-ink">Jalan</h1>
    </div>

    <p class="text-[15px] text-ink-2 max-w-[420px] text-center">
      Rencana jalan, anggaran, dan barang di satu tempat. Catat pengeluaran sambil jalan,
      biar tahu sisa anggaran sebelum hari terakhir.
    </p>

    <div class="flex items-center gap-3">
      <span class="status-live">Sedang jalan</span>
      <span class="status-plan">Rencana</span>
      <span class="status-draft">Draf</span>
    </div>

    <div class="card p-5 flex items-center gap-4">
      <span class="eyebrow">Terpakai</span>
      <span class="money text-[22px] font-600 text-warn-fg">Rp 2.357.000</span>
    </div>

    <div class="flex items-center gap-3">
      <button class="btn-primary" @click="ui.bump">
        <i class="i-lucide-plus" />
        Trip baru
      </button>
      <button class="btn-teal">
        <i class="i-lucide-map-pin" />
        Buka trip
      </button>
      <button class="btn-ghost">Bagikan</button>
    </div>

    <p class="text-[13px] text-muted money">
      persist smoke count: {{ ui.smokeCount }} (refresh should keep it)
    </p>

    <DialogRoot>
      <DialogTrigger class="btn-ghost">Buka sheet (Reka UI)</DialogTrigger>
      <DialogPortal>
        <DialogOverlay class="fixed inset-0 bg-[rgba(16,38,43,.34)] z-60" />
        <DialogContent
          class="anim-sheet fixed right-0 top-0 h-full w-[420px] max-w-[92vw] bg-paper shadow-drawer z-70 p-7 flex flex-col gap-4"
        >
          <DialogTitle class="font-display text-[22px] font-600">Reka UI Dialog</DialogTitle>
          <DialogDescription class="text-[14px] text-ink-2">
            Escape-to-close, focus trap, dan scrim sudah otomatis dari Reka UI.
          </DialogDescription>
          <DialogClose class="btn-primary mt-auto self-start">Tutup</DialogClose>
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </main>
</template>
