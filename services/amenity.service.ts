//services/amenity.service.ts

import { apiFetch } from "@/lib/api"

export type AmenityStatus = "ACTIVE" | "INACTIVE"

export type BackendAmenity = {
  id: string
  name: string
  status: AmenityStatus
}

export async function listAmenitiesService() {
  return apiFetch<BackendAmenity[]>("/api/amenity", { auth: true })
}

export async function createAmenityService(body: { name: string }) {
  return apiFetch<BackendAmenity>("/api/amenity", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateAmenityService(id: string, body: { name: string }) {
  return apiFetch<BackendAmenity>(`/api/amenity/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateAmenityStatusService(
  id: string,
  status: AmenityStatus,
) {
  return apiFetch<void>(`/api/amenity/update_status/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status }),
  })
}
