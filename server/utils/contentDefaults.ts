import type { ContentDoc } from '../repositories/types'

/** Seed content shipped with the app; the admin can override it via /admin. */
export function defaultContent(): ContentDoc {
  return {
    templates: [
      { id: 'tpl-sumba', name: 'Sumba 4 hari', sub: 'Waingapu, Wairinding, Tanggedu', mat: 'pantai', days: 4, plan: 3100000 },
      { id: 'tpl-bromo', name: 'Bromo–Ijen 5 hari', sub: 'Cemoro Lawang & Banyuwangi', mat: 'gunung', days: 5, plan: 4600000 },
      { id: 'tpl-ubud', name: 'Ubud hemat 3 hari', sub: 'Tegallalang & Ubud pusat', mat: 'sawah', days: 3, plan: 1850000 },
      { id: 'tpl-bali', name: 'Bali Selatan 4 hari', sub: 'Seminyak, Uluwatu, Canggu', mat: 'kota', days: 4, plan: 2700000 },
      { id: 'tpl-jogja', name: 'Yogyakarta 3 hari', sub: 'Malioboro, Prambanan, Borobudur', mat: 'kuil', days: 3, plan: 2100000 },
      { id: 'tpl-lbj', name: 'Labuan Bajo 5 hari', sub: 'Komodo, Padar, Pink Beach', mat: 'pulau', days: 5, plan: 5400000 },
    ],
    recs: [
      { id: 'r-ktp', label: 'KTP dan kartu vaksin', group: 'Dokumen', req: true },
      { id: 'r-obat', label: 'Obat pribadi', group: 'Dokumen', req: true, url: 'https://www.halodoc.com/kategori/obat-obatan' },
      { id: 'r-pb', label: 'Powerbank 10.000 mAh', group: 'Elektronik', url: 'https://www.tokopedia.com/search?q=powerbank+10000mah' },
      { id: 'r-charger', label: 'Kabel dan kepala charger', group: 'Elektronik' },
      { id: 'r-sunblock', label: 'Sunblock SPF 50', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=sunblock+spf+50' },
      { id: 'r-botol', label: 'Botol minum lipat', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=botol+minum+lipat' },
      { id: 'r-sandal', label: 'Sandal gunung', group: 'Pakaian', url: 'https://www.tokopedia.com/search?q=sandal+gunung', mats: ['pantai'] },
      { id: 'r-drybag', label: 'Dry bag 10 liter', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=dry+bag+10+liter', mats: ['pantai'], cats: ['Tiket & atraksi'] },
      { id: 'r-renang', label: 'Baju renang', group: 'Pakaian', mats: ['pantai'] },
      { id: 'r-jaket', label: 'Jaket tebal anti angin', group: 'Pakaian', req: true, url: 'https://www.tokopedia.com/search?q=jaket+gunung', mats: ['gunung'] },
      { id: 'r-glove', label: 'Sarung tangan', group: 'Pakaian', mats: ['gunung'] },
      { id: 'r-masker', label: 'Masker debu', group: 'Perlengkapan', req: true, url: 'https://www.tokopedia.com/search?q=masker+debu', mats: ['gunung'] },
      { id: 'r-headlamp', label: 'Senter kepala', group: 'Elektronik', url: 'https://www.tokopedia.com/search?q=headlamp', mats: ['gunung'] },
      { id: 'r-jashujan', label: 'Jas hujan tipis', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=jas+hujan', mats: ['sawah'] },
      { id: 'r-antislip', label: 'Sepatu anti selip', group: 'Pakaian', mats: ['sawah'] },
      { id: 'r-antimaling', label: 'Tas selempang anti maling', group: 'Perlengkapan', url: 'https://www.tokopedia.com/search?q=tas+anti+maling', mats: ['kota'] },
      { id: 'r-topi', label: 'Topi', group: 'Pakaian', mats: ['kota'] },
    ],
  }
}
