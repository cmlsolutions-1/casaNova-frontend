import { apiFetch } from "@/lib/api"

export type RoomType =
  | "SIMPLE"
  | "DOUBLE"
  | "TRIPLE"
  | "QUADRUPLE"
  | "QUINTUPLE"
  | "SEXTUPLE"
  | "VIP"

export type RoomStatus = "ACTIVE" | "INACTIVE"

export type BackendRoom = {
  id: string
  type: RoomType
  nameRoom: string
  description: string
  singleBeds: number
  doubleBeds: number
  cabin: number
  extraDouble: number
  capacity: number
  price: number
  status: RoomStatus
  isBusy: boolean

  // VIENE DEL BACKEND EN GET
  amenities: { id: string; name: string }[] // (según tu ejemplo actual)
  images: string[] // si son urls. si fueran ids, lo ajustamos luego
}

// Para crear/editar (REQUEST BODY)
export type RoomUpsertBody = {
  type: RoomType
  nameRoom: string
  description: string
  singleBeds: number
  doubleBeds: number
  cabin: number
  extraDouble: number
  capacity: number
  price: number
  status: RoomStatus
  isBusy: boolean
  amenityIds: string[]
  imagesIds: string[]
}

export async function listRoomsService() {
  return apiFetch<BackendRoom[]>("/api/room", { auth: true })
}

export async function getRoomService(id: string) {
  return apiFetch<BackendRoom>(`/api/room/${id}`, { auth: true })
}

export async function createRoomService(body: RoomUpsertBody) {
  return apiFetch<BackendRoom>("/api/room", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateRoomService(id: string, body: RoomUpsertBody) {
  return apiFetch<BackendRoom>(`/api/room/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateRoomStatusService(id: string, status: RoomStatus) {
  return apiFetch<{}>(`/api/room/update_status/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status }),
  })
}

export async function updateRoomBusyService(id: string, isBusy: boolean) {
  return apiFetch<{}>(`/api/room/update_status_busy/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ isBusy }),
  })
}