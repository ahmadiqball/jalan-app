<script setup lang="ts">
definePageMeta({ layout: 'blank', public: true })
useHead({ title: 'Masuk · Jalan' })

const session = useSessionStore()
const email = ref(session.email || 'rina@jalan.id')
const pw = ref('')
const err = ref('')

function validate(): boolean {
  if (!email.value.trim() || !email.value.includes('@')) {
    err.value = 'Masukkan email yang benar.'
    return false
  }
  if (pw.value.length < 4) {
    err.value = 'Sandi minimal 4 karakter.'
    return false
  }
  err.value = ''
  return true
}

function signIn() {
  if (!validate()) return
  session.signIn({ email: email.value.trim() })
  navigateTo('/beranda')
}
function signInGuest() {
  session.signIn({ email: 'tamu@jalan.id', name: 'Tamu' })
  navigateTo('/beranda')
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Enter') signIn()
}

const chips = ['6 trip tersimpan', 'Anggaran per kategori', 'Daftar barang otomatis']
</script>

<template>
  <div class="min-h-screen flex flex-wrap">
    <!-- left panel -->
    <div
      class="flex-1 basis-[480px] min-h-[420px] relative overflow-hidden bg-teal-100 flex flex-col justify-between p-[44px_48px] gap-8"
    >
      <div class="absolute rounded-full bg-sand-100" style="left:54px;top:56px;width:104px;height:104px" />
      <div class="absolute" style="left:-90px;bottom:-70px;width:520px;height:300px;border-radius:300px 300px 0 0;background:#C8E2DE" />
      <div class="absolute" style="right:-120px;bottom:-90px;width:460px;height:250px;border-radius:250px 250px 0 0;background:#8FC2BE" />
      <CoreMotif kind="plane" :size="60" color="#8FC2BE" :opacity="0.7" class="absolute" style="right:52px;top:44px;transform:rotate(24deg)" />
      <CoreMotif kind="balloon" :size="54" color="#8FC2BE" :opacity="0.55" class="absolute" style="left:150px;top:34px" />
      <CoreMotif kind="ship" :size="58" color="#8FC2BE" :opacity="0.6" class="absolute" style="right:96px;bottom:56px" />

      <div class="relative">
        <CoreLogo :size="34" :text-size="23" />
      </div>
      <div class="relative max-w-[420px] flex flex-col gap-4">
        <div class="font-display text-[40px] leading-[1.12] font-600 text-ink [text-wrap:pretty]">
          Rencana jalan, anggaran, dan barang di satu tempat.
        </div>
        <div class="text-[15.5px] leading-[1.55] text-ink-2 max-w-[360px]">
          Catat pengeluaran sambil jalan, biar tahu sisa anggaran sebelum hari terakhir.
        </div>
      </div>
      <div class="relative flex gap-[10px] flex-wrap text-[12.5px] font-700 text-teal-700">
        <span v-for="c in chips" :key="c" class="bg-white rounded-pill px-[14px] py-2">{{ c }}</span>
      </div>
    </div>

    <!-- right form -->
    <div class="flex-1 basis-[420px] flex items-center justify-center p-[48px_32px] bg-paper">
      <div class="w-full max-w-[376px] flex flex-col gap-[22px] anim-rise">
        <div>
          <div class="font-display text-[30px] font-600">Masuk</div>
          <div class="text-[14.5px] text-ink-2 mt-[6px]">Lanjutkan trip yang sedang jalan.</div>
        </div>

        <div class="flex flex-col gap-[14px]">
          <CoreInput v-model="email" type="email" label="Email" eyebrow placeholder="nama@email.com" @keydown="onKey" />
          <CoreInput v-model="pw" type="password" label="Sandi" eyebrow placeholder="Minimal 4 karakter" @keydown="onKey" />
          <div v-if="err" class="bg-warn-bg text-warn-fg rounded-banner px-[14px] py-[10px] text-[13px] font-600">
            {{ err }}
          </div>
        </div>

        <div class="flex flex-col gap-[11px]">
          <CoreButton variant="primary" block @click="signIn">Masuk</CoreButton>
          <CoreButton variant="ghost" block @click="signInGuest">Coba tanpa akun</CoreButton>
        </div>

        <div class="border-t border-sand-line pt-4 text-[13.5px] text-muted">
          Belum punya akun? <a href="#" class="font-600" @click.prevent="signInGuest">Daftar gratis</a>
        </div>
      </div>
    </div>
  </div>
</template>
