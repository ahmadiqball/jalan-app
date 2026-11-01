import type { H3Event } from 'h3'

function config(event: H3Event) {
  const cfg = useRuntimeConfig(event)
  const serverKey = cfg.midtransServerKey as string
  if (!serverKey) throw createError({ statusCode: 503, statusMessage: 'Pembayaran belum tersedia' })
  const live = String(cfg.midtransProduction) === 'true'
  const env = live ? '' : '.sandbox'
  return {
    authorization: 'Basic ' + Buffer.from(serverKey + ':').toString('base64'),
    snapUrl: `https://app${env}.midtrans.com/snap/v1/transactions`,
    apiUrl: `https://api${env}.midtrans.com/v2`,
  }
}

/** Create a hosted Snap payment page; returns its URL. */
export async function createSnapPayment(event: H3Event, input: { orderId: string; amount: number; itemName: string; finishUrl: string }): Promise<string> {
  const { authorization, snapUrl } = config(event)
  const res = await $fetch<{ redirect_url: string }>(snapUrl, {
    method: 'POST',
    headers: { Authorization: authorization, Accept: 'application/json' },
    body: {
      transaction_details: { order_id: input.orderId, gross_amount: input.amount },
      item_details: [{ id: input.itemName, name: input.itemName, price: input.amount, quantity: 1 }],
      callbacks: { finish: input.finishUrl },
    },
  })
  return res.redirect_url
}

export interface MidtransTransaction {
  order_id?: string
  gross_amount?: string
  transaction_status?: string
  fraud_status?: string
  payment_type?: string
}

/**
 * The transaction as Midtrans has it. An order not paid yet comes back with no
 * status: Midtrans answers 404 until a payment method is chosen.
 */
export async function getTransaction(event: H3Event, orderId: string): Promise<MidtransTransaction> {
  const { authorization, apiUrl } = config(event)
  const res = await $fetch.raw<MidtransTransaction>(`${apiUrl}/${encodeURIComponent(orderId)}/status`, {
    headers: { Authorization: authorization, Accept: 'application/json' },
    ignoreResponseError: true,
  })
  if (res.status === 404) return {}
  if (!res.ok) throw createError({ statusCode: 502, statusMessage: 'Midtrans tidak merespons' })
  return res._data ?? {}
}
