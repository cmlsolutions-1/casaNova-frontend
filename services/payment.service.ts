import { apiFetch } from "@/lib/api-fetch"

export type CreatePaymentBody = {
  reservationId: string
}

export type PaymentPreferenceResponse = {
  ok: boolean
  message: string
  data: {
    paymentId: string
    preferenceId: string
    initPoint: string
    sandboxInitPoint: string
  }
  errors: any
  meta: any
}

export async function createPaymentPublicService(body: CreatePaymentBody) {
  return apiFetch<PaymentPreferenceResponse>("/api/payment", {
    method: "POST",
    body: JSON.stringify(body),
  })
}