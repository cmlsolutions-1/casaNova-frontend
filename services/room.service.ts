// services/room.service.ts
import { apiFetch } from "@/lib/api"

export type RoomType = "SIMPLE" | "DOUBLE" | "VIP"
export type RoomStatus = "ACTIVE" | "INACTIVE"

export type BackendRoom = {
  id: string
  type: RoomType
  nameRoom: string
  singleBeds: number
  doubleBeds: number
  capacity: number
  price: number
  status: RoomStatus
  isBusy: boolean
}

// Crear / Actualizar
export type RoomUpsertBody = Omit<BackendRoom, "id">

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

// Cambiar ACTIVE/INACTIVE (toggle o set)
export async function updateRoomStatusService(id: string, status: RoomStatus) {
  return apiFetch<{}>(`/api/room/update_status/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status }),
  })
}

// Cambiar disponibilidad (busy)
export async function updateRoomBusyService(id: string, isBusy: boolean) {
  return apiFetch<{}>(`/api/room/update_status_busy/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ isBusy }),
  })
}
