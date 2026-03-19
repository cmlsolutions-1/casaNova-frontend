//services/reservation.service.ts

import { apiFetch } from "@/lib/api"

export type ReservationStatus =
  | "PENDING"
  | "CONFIRMED"
  | "REJECTED"
  | "PAID_PENDING_APPROVAL"
  | "APPROVED"

export type ReservationType = "STAY" | "DAY_PASS"

export type CreateReservationBody = {
  startDate: string
  endDate: string
  clientDocument: string
  type: ReservationType
  rooms?: Array<{
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

export type ReservationImage = {
  id: string
  url: string
}

export type ReservationRoom = {
  id: string
  nameRoom: string
  price: number
  numberOfPeople: string | number
  images: ReservationImage[] | string[]
}

export type ReservationClient = {
  id: string
  fullName?: string
  documentNumber: string
}

export type ReservationServiceItem = {
  id: string
  name?: string
  price?: number
  amount?: number
}

export type ReservationDetailById = {
  id: string
  startDate: string
  endDate: string
  status: ReservationStatus
  totalValue: string | number
  reservationCode?: string | number
  client: ReservationClient
  rooms: ReservationRoom[]
  services: ReservationServiceItem[]
}

export type BackendReservationById = {
  ok: boolean
  message: string
  data: ReservationDetailById
  errors: any
  meta: any
}

export async function createReservationPublicService(body: CreateReservationBody) {
  return apiFetch<any>("/api/reservations", {
    method: "POST",
    body: JSON.stringify(body),
    rawResponse: true,
  })
}

export async function getReservationByIdPublicService(id: string) {
  return apiFetch<BackendReservationById>(`/api/reservations/get-by-id/${id}`, {
    method: "GET",
  })
}

export type ReservationByClientItem = {
  id: string
  startDate: string
  endDate: string
  reservationCode?: number | string
  status: ReservationStatus
  totalValue: number | string
  client: ReservationClient
  rooms: ReservationRoom[]
  services: ReservationServiceItem[]
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

export type ReservationListItem = {
  id: string
  startDate: string
  endDate: string
  status: ReservationStatus
  totalValue: number | string
  reservationCode?: string | number
  client?: ReservationClient
  rooms?: ReservationRoom[]
  services?: ReservationServiceItem[]
  createdAt?: string
  updatedAt?: string
}

export type BackendReservationList = {
  ok: boolean
  message: string
  data: {
    data: ReservationListItem[]
    meta: {
      total: number
      page: number
      limit: number
      totalPages: number
    }
  }
  errors: any
  meta: {
    path: string
    method: string
    timestamp: string
    statusCode: number
  }
}

export type ListReservationsParams = {
  start?: string
  end?: string
  clientDocument?: string
  page?: number
  limit?: number
}

function buildReservationsQuery(params?: ListReservationsParams) {
  const searchParams = new URLSearchParams()

  if (params?.start) searchParams.set("start", params.start)
  if (params?.end) searchParams.set("end", params.end)
  if (params?.clientDocument) searchParams.set("clientDocument", params.clientDocument)
  if (params?.page) searchParams.set("page", String(params.page))
  if (params?.limit) searchParams.set("limit", String(params.limit))

  const query = searchParams.toString()

  return query ? `/api/reservations?${query}` : "/api/reservations"
}

export async function listReservationsService(params?: ListReservationsParams) {
  return apiFetch<BackendReservationList>(buildReservationsQuery(params), {
    method: "GET",
    rawResponse: true,
  })
}

export type UpdateReservationByAdminBody = {
  startDate: string
  endDate: string
}

export type BackendReservationUpdatedByAdmin = {
  ok: boolean
  message: string
  data: {
    id: string
    startDate: string
    endDate: string
    status: string
    totalValue: number | string
  }
  errors: any
  meta: {
    path: string
    method: string
    timestamp: string
    statusCode: number
  }
}

export async function updateReservationByAdminService(
  id: string,
  body: UpdateReservationByAdminBody,
  token: string,
) {
  return apiFetch<BackendReservationUpdatedByAdmin>(
    `/api/reservations/update-by-admin/${id}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  )
}