<script setup lang="ts">
useHead({ title: 'Arsip · Jalan' })
</script>

<template>
  <div class="flex-1 w-full max-w-[1400px] mx-auto p-[30px_20px_60px] md:p-[30px_32px_60px] flex flex-col gap-5 anim-rise">
    <div>
      <div class="font-display text-[32px] font-600">Arsip</div>
      <div class="text-[15px] text-ink-2 mt-[5px]">
        Trip yang sudah selesai, dengan angka apa adanya untuk memperkirakan trip berikutnya.
      </div>
    </div>
    <div class="card p-8 text-muted text-[14px]">Belum ada trip yang diarsipkan.</div>
  </div>
</template>
