// Decorative cover art data, ported from the prototype. Never load-bearing.

export interface MatDef {
  bg: string
  a: string
  b: string
  sun: string
  radius: string
  clip: string
  label: string
  motif: string
}

/**
 * Broad trip categories. Keys are stored on the trip (trip.mat); labels are
 * defaults — the UI localizes via i18n `cat.<key>`. Old keys (sawah/kuil/…)
 * still resolve through matDef's alias map for backward compatibility.
 */
export const MATS: Record<string, MatDef> = {
  pantai: { bg: '#DEEEEC', a: '#C8E2DE', b: '#8FC2BE', sun: '#F1EEE1', radius: '110px 110px 0 0', clip: 'none', label: 'Pantai', motif: 'palm' },
  gunung: { bg: '#F1EEE1', a: '#E4DECB', b: '#D8D0BB', sun: '#FCE3D3', radius: '0', clip: 'polygon(0 100%,0 58%,30% 6%,56% 60%,100% 22%,100% 100%)', label: 'Gunung', motif: 'mountain' },
  alam: { bg: '#DEEEEC', a: '#C8E2DE', b: '#2F6B54', sun: '#F1EEE1', radius: '0 999px 999px 0', clip: 'none', label: 'Alam', motif: 'leaf' },
  budaya: { bg: '#F1EEE1', a: '#D8D0BB', b: '#C4B29E', sun: '#F1EEE1', radius: '0', clip: 'polygon(0 100%,14% 54%,28% 100%,46% 40%,62% 100%,78% 58%,100% 100%)', label: 'Budaya', motif: 'candi' },
  kota: { bg: '#FCE3D3', a: '#FCE3D3', b: '#FCE3D3', sun: '#F1EEE1', radius: '8px 8px 0 0', clip: 'polygon(0 100%,0 44%,18% 44%,18% 20%,40% 20%,40% 56%,64% 56%,64% 30%,86% 30%,86% 62%,100% 62%,100% 100%)', label: 'Kota', motif: 'camera' },
  kuliner: { bg: '#FCE3D3', a: '#F6E2CE', b: '#F0713A', sun: '#F1EEE1', radius: '999px 999px 0 0', clip: 'none', label: 'Kuliner', motif: 'food' },
  pulau: { bg: '#DEEEEC', a: '#8FC2BE', b: '#8FC2BE', sun: '#FCE3D3', radius: '160px 160px 0 0', clip: 'none', label: 'Pulau', motif: 'ship' },
  lainnya: { bg: '#F1EEE1', a: '#E4DECB', b: '#D8D0BB', sun: '#FCE3D3', radius: '999px 999px 0 0', clip: 'none', label: 'Lainnya', motif: 'compass' },
}

/** old category keys → current ones, so existing trips keep working */
const MAT_ALIAS: Record<string, string> = {
  sawah: 'alam',
  kuil: 'budaya',
  gurun: 'lainnya',
  luar: 'lainnya',
}
/** ordered keys for the category picker */
export const MAT_KEYS = Object.keys(MATS)

export interface MotifPart {
  d: string
  o?: number
  t?: string
}

export const MOTIFS: Record<string, MotifPart[]> = {
  plane: [{ d: 'M50 6c5 0 8 9 8 21v6l32 21v10l-32-10v20l12 10v8l-20-6-20 6v-8l12-10v-20l-32 10v-10l32-21v-6c0-12 3-21 8-21z' }],
  ship: [{ d: 'M46 8h5v58h-5z' }, { d: 'M53 14l22 44H53z', o: 0.85 }, { d: 'M44 26L24 58h20z', o: 0.68 }, { d: 'M8 62h84l-12 24H20z' }],
  palm: [
    { d: 'M45 92c1-25 4-40 13-55l7 4c-9 14-12 28-13 51z' },
    { d: 'M64 38c-13-10-28-7-34 3 11-5 22-3 31 3z', o: 0.9 },
    { d: 'M63 37c-4-15-17-23-30-21 12 4 21 11 25 23z', o: 0.7 },
    { d: 'M66 37c9-13 24-16 34-9-12-1-21 3-29 12z', o: 0.88 },
    { d: 'M67 40c14-4 26 3 30 15-9-9-19-12-29-9z', o: 0.66 },
    { d: 'M61 33c2-13 12-21 22-22-9 5-16 12-18 23z', o: 0.55 },
  ],
  mountain: [{ d: 'M4 88l32-58 16 28 12-20 32 50z' }, { d: 'M36 30l11 20-11 6-9-9z', o: 0.45 }],
  pagoda: [
    { d: 'M50 6l28 16H22z' }, { d: 'M44 22h12v10H44z', o: 0.8 }, { d: 'M50 30l32 18H18z' },
    { d: 'M42 48h16v12H42z', o: 0.8 }, { d: 'M50 58l38 20H12z' }, { d: 'M38 78h24v14H38z', o: 0.9 },
  ],
  eiffel: [
    { d: 'M48 4h4v10h-4z', o: 0.8 },
    { d: 'M50 12c0 18 6 42 23 78h-10c-9-31-13-50-13-60 0 10-4 29-13 60H27c17-36 23-60 23-78z' },
    { d: 'M33 56h34v6H33z', o: 0.75 }, { d: 'M26 76h48v6H26z', o: 0.75 },
  ],
  compass: [
    { d: 'M50 4a46 46 0 100 92 46 46 0 100-92zm0 9a37 37 0 110 74 37 37 0 110-74z', o: 0.8 },
    { d: 'M50 22l10 28 28 10-28 10-10 28-10-28-28-10 28-10z' },
  ],
  camera: [
    { d: 'M10 30h20l6-9h28l6 9h20v52H10z' },
    { d: 'M50 38a18 18 0 100 36 18 18 0 100-36z', o: 0.45 }, { d: 'M50 48a8 8 0 100 16 8 8 0 100-16z', o: 0.8 },
  ],
  cactus: [
    { d: 'M43 32h14v58H43z' }, { d: 'M22 46h9v19c0 7 5 9 12 9v9c-14 0-21-7-21-18z', o: 0.9 },
    { d: 'M69 38h9v26c0 11-7 18-21 18v-9c8 0 12-3 12-9z', o: 0.72 },
  ],
  candi: [
    { d: 'M50 8l11 17H39z' }, { d: 'M42 25h16v11H42z', o: 0.88 }, { d: 'M32 36h36v11H32z' },
    { d: 'M23 47h54v13H23z', o: 0.84 }, { d: 'M14 60h72v15H14z' }, { d: 'M6 75h88v17H6z', o: 0.9 },
  ],
  balloon: [
    { d: 'M50 6c17 0 28 14 28 29 0 15-14 27-28 42-14-15-28-27-28-42 0-15 11-29 28-29z' },
    { d: 'M44 78h12l-2 14H46z', o: 0.85 }, { d: 'M40 76h20v4H40z', o: 0.55 },
  ],
  leaf: [
    { d: 'M50 92c0-32 7-53 24-70-2 36-9 55-24 70z' },
    { d: 'M50 92c0-32-7-53-24-70 2 36 9 55 24 70z', o: 0.72 },
  ],
  food: [
    { d: 'M12 44h76c0 24-17 41-38 41S12 68 12 44z' },
    { d: 'M8 42h84v6H8z', o: 0.85 },
    { d: 'M60 8l7 2-15 36-6-2z', o: 0.72 },
    { d: 'M71 11l7 2-17 35-5-2z', o: 0.52 },
  ],
}

/** normalize any (possibly legacy) category key to a current one */
export function matKey(key: string): string {
  return MATS[key] ? key : MAT_ALIAS[key] || 'lainnya'
}
export function matDef(key: string): MatDef {
  return MATS[matKey(key)] || MATS.pantai!
}
