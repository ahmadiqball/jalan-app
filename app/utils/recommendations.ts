/** App-curated packing recommendations (buy links provided by the app, not the user). */
export interface PackRec {
  label: string
  group: string
  req?: boolean
  url?: string
}

const COMMON: PackRec[] = [
  { label: 'KTP dan kartu vaksin', group: 'Dokumen', req: true },
  { label: 'Obat pribadi', group: 'Dokumen', req: true, url: 'https://www.halodoc.com/kategori/obat-obatan' },
  { label: 'Powerbank 10.000 mAh', group: 'Elektronik', url: 'https://www.tokopedia.com/search?q=powerbank+10000mah' },
  { label: 'Kabel dan kepala charger', group: 'Elektronik' },
  { label: 'Sunblock SPF 50', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=sunblock+spf+50' },
  { label: 'Botol minum lipat', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=botol+minum+lipat' },
]

/** Extra suggestions keyed by trip motif. */
const BY_MOTIF: Record<string, PackRec[]> = {
  pantai: [
    { label: 'Sandal gunung', group: 'Pakaian', url: 'https://www.tokopedia.com/search?q=sandal+gunung' },
    { label: 'Dry bag 10 liter', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=dry+bag+10+liter' },
    { label: 'Baju renang', group: 'Pakaian' },
  ],
  gunung: [
    { label: 'Jaket tebal anti angin', group: 'Pakaian', req: true, url: 'https://www.tokopedia.com/search?q=jaket+gunung' },
    { label: 'Sarung tangan', group: 'Pakaian' },
    { label: 'Masker debu', group: 'Perlengkapan', req: true, url: 'https://www.tokopedia.com/search?q=masker+debu' },
    { label: 'Senter kepala', group: 'Elektronik', url: 'https://www.tokopedia.com/search?q=headlamp' },
  ],
  sawah: [
    { label: 'Jas hujan tipis', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=jas+hujan' },
    { label: 'Sepatu anti selip', group: 'Pakaian' },
  ],
  kota: [
    { label: 'Tas selempang anti maling', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=tas+anti+maling' },
    { label: 'Topi', group: 'Pakaian' },
  ],
}

export function packingRecs(mat: string): PackRec[] {
  return [...COMMON, ...(BY_MOTIF[mat] || [])]
}
