<script setup lang="ts">
/**
 * Full-page screen for the first account load. A route draws itself towards the
 * pin, slowing as it nears the end, and only arrives once the data has.
 */
const ROUTE = 'M26 92 C 84 18, 122 118, 172 66 S 246 24, 292 48'
const CRUISE_END = 0.9
const CRUISE_RATE = 0.0009 // per ms; the share of the remaining route covered
const ARRIVE_MS = 380
const SLOW_LOAD_MS = 1500
const STEP_MS = 1800

const session = useSessionStore()
const ready = useState<boolean>('account-ready', () => false)
const { t } = useI18n()

const route = ref<SVGPathElement>()
const shown = ref(false)
const progress = ref(0)
const dot = ref({ x: 26, y: 92 })
const step = ref(-1)
const steps = computed(() => [t('app.loadingSteps.packing'), t('app.loadingSteps.map'), t('app.loadingSteps.plan')])

let frame = 0
let stepTimer: ReturnType<typeof setTimeout> | undefined
let last = 0
let arriveFrom = 0
let arriveAt = 0

function place() {
  const el = route.value
  if (!el) return
  const p = el.getPointAtLength(el.getTotalLength() * progress.value)
  dot.value = { x: p.x, y: p.y }
}

function tick(now: number) {
  const dt = last ? now - last : 0
  last = now
  if (ready.value) {
    arriveAt ||= now
    arriveFrom ||= progress.value
    const k = Math.min((now - arriveAt) / ARRIVE_MS, 1)
    progress.value = arriveFrom + (1 - arriveFrom) * k * (2 - k)
    place()
    if (k === 1) return stop()
  } else {
    progress.value += (CRUISE_END - progress.value) * (1 - Math.exp(-CRUISE_RATE * dt))
    place()
  }
  frame = requestAnimationFrame(tick)
}

function nextStep() {
  step.value = (step.value + 1) % steps.value.length
  stepTimer = setTimeout(nextStep, STEP_MS)
}

function start() {
  shown.value = true
  progress.value = 0
  step.value = -1
  last = arriveFrom = arriveAt = 0
  stepTimer = setTimeout(nextStep, SLOW_LOAD_MS)
  nextTick(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) progress.value = CRUISE_END
    else frame = requestAnimationFrame(tick)
    place()
  })
}

function stop() {
  cancelAnimationFrame(frame)
  frame = 0
  clearTimeout(stepTimer)
  shown.value = false
}

onMounted(() => {
  watch(() => session.authed && !ready.value, (loading) => {
    if (loading) start()
    // the running frame loop finishes the route, then hides the screen
    else if (shown.value && (!session.authed || !frame)) stop()
  }, { immediate: true })
})
onBeforeUnmount(stop)
</script>

<template>
  <Transition leave-active-class="transition-opacity duration-300" leave-to-class="opacity-0">
    <div v-if="shown" class="fixed inset-0 z-[50] bg-paper flex flex-col items-center justify-center gap-4 px-6" role="status" :aria-label="$t('app.accountLoading')">
      <CoreLogo :size="38" :text-size="26" />
      <svg viewBox="0 0 320 120" class="w-full max-w-[320px]" aria-hidden="true">
        <path :d="ROUTE" fill="none" stroke="var(--sand-line-3)" stroke-width="3" stroke-linecap="round" stroke-dasharray="0.1 9" />
        <path ref="route" :d="ROUTE" fill="none" class="stroke-teal-600" stroke-width="3" stroke-linecap="round" pathLength="1" stroke-dasharray="1" :stroke-dashoffset="1 - progress" />
        <circle cx="26" cy="92" r="6" class="fill-paper stroke-teal-600" stroke-width="3" />
        <g transform="translate(292 48)">
          <path d="M0 0c-6-8-11-13-11-20a11 11 0 1 1 22 0c0 7-5 12-11 20z" class="fill-teal-600" />
          <circle cy="-20" r="4" class="fill-paper" />
        </g>
        <circle :cx="dot.x" :cy="dot.y" r="6.5" fill="var(--brand-orange)" class="stroke-paper" stroke-width="2.5" />
      </svg>
      <div class="h-[20px] text-[13.5px] text-ink-2">{{ steps[step] }}</div>
    </div>
  </Transition>
</template>
