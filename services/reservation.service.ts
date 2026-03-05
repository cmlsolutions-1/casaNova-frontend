//services/reservation.service.ts

import { apiFetch } from "@/lib/api-fetch"

export type CreateReservationBody = {
  startDate: string // ISO
  endDate: string   // ISO
  clientDocument: string
  rooms: Array<{
    roomId: string
    numberOfPeople: number
    children: number
    babys: number
    pets?: number
  }>
  services: Array<{
    serviceId: string
    amount: number
    startAt?: string
    endAt?: string
  }>
}

export type BackendReservationCreated = {
  id: string
  startDate: any
  endDate: any
  status: string
  totalValue: number
}

export async function createReservationPublicService(body: any) {
  return apiFetch<any>("/api/reservations", {
    method: "POST",
    body: JSON.stringify(body),
  })
}