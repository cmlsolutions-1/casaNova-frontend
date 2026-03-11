//services/reservation.service.ts
import { apiFetch } from "@/lib/api-fetch"

export type CreateReservationBody = {
  startDate: string
  endDate: string
  clientDocument: string
  rooms: Array<{
    roomId: string
    numberOfPeople: number
    children?: number
    babys?: number
    pets?: number
  }>
  services?: Array<{
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
  totalValue: string | number
}

export type BackendReservationById = {
  ok: boolean
  message: string
  data: {
    id: string
    startDate: string
    endDate: string
    status: "PENDING" | "CONFIRMED" | "REJECTED" | "PAID_PENDING_APPROVAL"
    totalValue: string | number
    client: {
      id: string
      fullName: string
      documentNumber: string
    }
    rooms: Array<{
      id: string
      nameRoom: string
      price: number
      numberOfPeople: string | number
      images: { id: string; url: string }[]
    }>
    services: Array<{
      id: string
      name?: string
      price?: number
      amount?: number
    }>
  }
  errors: any
  meta: any
}

export async function createReservationPublicService(body: CreateReservationBody) {
  return apiFetch<any>("/api/reservations", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export async function getReservationByIdPublicService(id: string) {
  return apiFetch<BackendReservationById>(`/api/reservations/get-by-id/${id}`, {
    method: "GET",
  })
}


export type ReservationRoom = {
  id: string
  nameRoom: string
  price: number
  numberOfPeople: string
  images: string[]
}

export type ReservationClient = {
  id: string
  fullName: string
  documentNumber: string
}

export type ReservationByClientItem = {
  id: string
  startDate: string
  endDate: string
  reservationCode: number | string
  status: string
  totalValue: number | string
  client: ReservationClient
  rooms: ReservationRoom[]
  services: any[]
}

export type BackendReservationByClientAndCode = {
  ok: boolean
  message: string
  data: ReservationByClientItem | null
  errors: any
  meta: {
    path: string
    method: string
    timestamp: string
    statusCode: number
  }
}

export async function getReservationByClientAndCodePublicService(
  identificationNumber: string,
  code: string,
) {
  return apiFetch<BackendReservationByClientAndCode>(
    `/api/reservations/get-reservation-client/${identificationNumber}/reservation/${code}`,
    {
      method: "GET",
    },
  )
}