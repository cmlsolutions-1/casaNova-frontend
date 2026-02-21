// services/room.service.ts
import { apiFetch } from "@/lib/api"

export type RoomType = "SIMPLE" | "DOUBLE" | "VIP"
export type RoomStatus = "ACTIVE" | "INACTIVE"

export type RoomAmenity = { id: string; name: string }

// Esto es lo que realmente llega del backend
export type BackendRoomFromApi = {
  id: string
  type: RoomType
  nameRoom: string
  description: string
  singleBeds: number
  doubleBeds: number
  capacity: number
  price: number
  status: RoomStatus
  isBusy: boolean
  amenities: RoomAmenity[] 
}

// Esto es lo que tu UI necesita para crear/editar (PUT/POST)
export type BackendRoom = Omit<BackendRoomFromApi, "amenities"> & {
  amenityIds: string[]        
  amenities?: RoomAmenity[]   
}

export type RoomUpsertBody = Omit<BackendRoom, "id" | "amenities">

function normalizeRoom(r: BackendRoomFromApi): BackendRoom {
  return {
    ...r,
    amenityIds: (r.amenities ?? []).map((a) => a.id),
    amenities: r.amenities ?? [],
  }
}

export async function listRoomsService() {
  const data = await apiFetch<BackendRoomFromApi[]>("/api/room", { auth: true })
  return data.map(normalizeRoom)
}

export async function getRoomService(id: string) {
  const data = await apiFetch<BackendRoomFromApi>(`/api/room/${id}`, { auth: true })
  return normalizeRoom(data)
}

export async function createRoomService(body: RoomUpsertBody) {
  return apiFetch<BackendRoomFromApi>("/api/room", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateRoomService(id: string, body: RoomUpsertBody) {
  return apiFetch<BackendRoomFromApi>(`/api/room/${id}`, {
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