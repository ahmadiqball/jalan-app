<script setup lang="ts">
import type { Member } from '~/types/domain'

const props = withDefaults(defineProps<{ member: Member; tripId: string; canManage?: boolean }>(), {
  canManage: false,
})
const trips = useTripsStore()
const { flash } = useToast()

const isOwner = computed(() => props.member.role === 'Pemilik')
const isPending = computed(() => props.member.status === 'menunggu')

const role = computed({
  get: () => props.member.role,
  set: (v: string) => trips.setMemberRole(props.tripId, props.member.id, v as Member['role']),
})
</script>

<template>
  <div class="flex items-center gap-3 py-[12px] border-b border-sand-100 last:border-0">
    <CoreAvatar :name="member.name" :size="40" />
    <div class="flex-1 min-w-0">
      <div class="flex items-center gap-2">
        <span class="text-[14px] font-700 truncate">{{ member.name }}</span>
        <span v-if="isPending" class="rounded-pill bg-sand-100 text-warn-fg2 px-[9px] py-[3px] text-[11px] font-700">Menunggu</span>
        <span v-else class="rounded-pill bg-teal-100 text-teal-700 px-[9px] py-[3px] text-[11px] font-700">Aktif</span>
      </div>
      <div class="text-[12.5px] text-muted truncate">{{ member.email }}</div>
    </div>

    <span v-if="isOwner" class="rounded-pill bg-teal-100 text-teal-700 px-[13px] py-[7px] text-[12.5px] font-700 shrink-0">Pemilik</span>
    <!-- owner-only management: change role / revoke access -->
    <template v-else-if="canManage">
      <button v-if="isPending" class="text-[13px] font-600 text-teal-600 shrink-0" @click="flash('Undangan dikirim ulang')">Kirim ulang</button>
      <CoreSelect v-model="role" :options="['Bisa ubah', 'Hanya lihat']" small />
      <button
        class="w-[28px] h-[28px] rounded-full text-muted hover:text-warn-fg hover:bg-warn-bg flex items-center justify-center shrink-0"
        title="Keluarkan"
        @click="trips.removeMember(tripId, member.id); flash('Anggota dikeluarkan')"
      >
        <i class="i-lucide-x text-[15px]" />
      </button>
    </template>
    <!-- everyone else sees the role read-only -->
    <span v-else class="rounded-pill bg-sand-100 text-ink-2 px-[13px] py-[7px] text-[12.5px] font-700 shrink-0">{{ member.role }}</span>
  </div>
</template>
