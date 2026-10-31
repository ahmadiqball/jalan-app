import { createHash, timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

function config(event: H3Event) {
  const cfg = useRuntimeConfig(event)
  const serverKey = cfg.midtransServerKey as string
  if (!serverKey) throw createError({ statusCode: 503, statusMessage: 'Pembayaran belum tersedia' })
  const live = String(cfg.midtransProduction) === 'true'
  return { serverKey, snapUrl: `https://app${live ? '' : '.sandbox'}.midtrans.com/snap/v1/transactions` }
}

/** Create a hosted Snap payment page; returns its URL. */
export async function createSnapPayment(event: H3Event, input: { orderId: string; amount: number; itemName: string; finishUrl: string }): Promise<string> {
  const { serverKey, snapUrl } = config(event)
  const res = await $fetch<{ redirect_url: string }>(snapUrl, {
    method: 'POST',
    headers: { Authorization: 'Basic ' + Buffer.from(serverKey + ':').toString('base64'), Accept: 'application/json' },
    body: {
      transaction_details: { order_id: input.orderId, gross_amount: input.amount },
      item_details: [{ id: input.itemName, name: input.itemName, price: input.amount, quantity: 1 }],
      callbacks: { finish: input.finishUrl },
    },
  })
  return res.redirect_url
}

export interface MidtransNotification {
  order_id?: string
  status_code?: string
  gross_amount?: string
  signature_key?: string
  transaction_status?: string
  fraud_status?: string
}

/** Midtrans signs order_id + status_code + gross_amount + server key with SHA-512. */
export function verifyNotification(event: H3Event, n: MidtransNotification): boolean {
  const { serverKey } = config(event)
  const expected = createHash('sha512').update(`${n.order_id}${n.status_code}${n.gross_amount}${serverKey}`).digest('hex')
  const given = String(n.signature_key || '')
  return given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected))
}
