import { defineConfig, presetWind3, presetIcons, presetTypography } from 'unocss'

export default defineConfig({
  presets: [
    presetWind3(),
    presetIcons({
      scale: 1.1,
      extraProperties: { display: 'inline-block', 'vertical-align': 'middle' },
    }),
    presetTypography(),
  ],
  // Icons chosen at runtime (category icons in CAT_ICON + the icon picker's
  // ICON_CHOICES) live in .ts files UnoCSS doesn't scan, so their classes must
  // be pre-generated here. Keep in sync with ICON_CHOICES in utils/categories.ts.
  safelist: [
    'i-lucide-utensils', 'i-lucide-coffee', 'i-lucide-bus', 'i-lucide-car',
    'i-lucide-plane', 'i-lucide-ticket', 'i-lucide-bed-double', 'i-lucide-map-pin',
    'i-lucide-shopping-bag', 'i-lucide-gift', 'i-lucide-camera', 'i-lucide-waves',
    'i-lucide-mountain', 'i-lucide-sun', 'i-lucide-wine', 'i-lucide-ellipsis',
  ],
  theme: {
    colors: {
      // primary action = terracotta (HTML source of truth, not teal)
      primary: { DEFAULT: '#C85A28', hover: '#AE4C22' },
      ink: { DEFAULT: '#10262B', 2: '#33474C' },
      muted: '#6C7C7D',
      teal: {
        700: '#0A4F55',
        600: '#0E6E76',
        100: '#DEEEEC',
        deep: '#CFE3E1',
        soft: '#C8E2DE',
        soft2: '#8FC2BE',
      },
      paper: '#FBFAF5',
      sand: { 100: '#F1EEE1', line: '#EDE9DA', line2: '#E4DECB', line3: '#D8D0BB' },
      warn: { bg: '#FCE3D3', fg: '#C85A28', fg2: '#8A6314' },
      brand: { orange: '#F0713A', green: '#2F6B54', amber: '#D98F3B' },
      peach: { bg: '#F6E2CE', fg: '#9C4718' },
    },
    fontFamily: {
      sans: "'Plus Jakarta Sans', system-ui, sans-serif",
      display: "'Fraunces', Georgia, serif",
      mono: "'IBM Plex Mono', ui-monospace, monospace",
    },
    borderRadius: {
      cb: '6px',
      xs: '11px',
      banner: '12px',
      field: '14px',
      card: '18px',
      lg2: '20px',
      xl2: '22px',
      hero: '26px',
      pill: '999px',
    },
    boxShadow: {
      card: '0 18px 40px -28px rgba(16,38,43,.3)',
      lift: '0 24px 44px -32px rgba(16,38,43,.55)',
      drop: '0 22px 40px -22px rgba(16,38,43,.28)',
      drawer: '-20px 0 60px -20px rgba(16,38,43,.4)',
      sheet: '-30px 0 70px -30px rgba(16,38,43,.5)',
      avatar: '0 12px 24px -14px rgba(16,38,43,.35)',
    },
  },
  shortcuts: {
    // typography helpers
    'font-display': 'font-display tracking-[-.02em]',
    'money': 'font-mono tabular-nums whitespace-nowrap',
    'eyebrow': 'font-mono text-[12px] font-700 tracking-[.08em] uppercase text-muted',

    // surfaces
    'card': 'bg-white border border-sand-line rounded-card shadow-card',
    'field': 'w-full border border-sand-line2 bg-white rounded-field px-[14px] py-[12px] text-[14px] text-ink placeholder-muted outline-none',

    // buttons
    'btn': 'inline-flex items-center justify-center gap-2 rounded-pill font-700 cursor-pointer transition-colors select-none',
    'btn-primary': 'btn bg-primary text-white px-[22px] py-[13px] text-[14.5px] shadow-[0_8px_18px_-10px_rgba(16,38,43,.28)] hover:bg-primary-hover',
    'btn-teal': 'btn bg-teal-600 text-white px-[22px] py-[13px] text-[14.5px] hover:bg-teal-700',
    'btn-ghost': 'btn bg-white border border-sand-line2 text-ink-2 px-[20px] py-[12px] text-[14px] hover:border-sand-line3',

    // chips / pills
    'chip': 'inline-flex items-center gap-2 rounded-pill px-[15px] py-[9px] text-[13px] font-600 cursor-pointer transition-colors',
    'chip-active': 'chip bg-teal-100 text-teal-700',
    'chip-idle': 'chip bg-transparent text-ink-2 border border-sand-line hover:bg-sand-100',
    'status-live': 'inline-flex items-center rounded-pill bg-teal-100 text-teal-700 px-[11px] py-[5px] text-[12px] font-700',
    'status-plan': 'inline-flex items-center rounded-pill bg-sand-100 text-ink-2 px-[11px] py-[5px] text-[12px] font-700',
    'status-draft': 'inline-flex items-center rounded-pill bg-sand-100 text-muted px-[11px] py-[5px] text-[12px] font-700',
  },
})
