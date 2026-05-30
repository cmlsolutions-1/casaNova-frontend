// services/season.service.ts

import { apiFetch } from "@/lib/api"

export type SeasonStatus = "ACTIVE" | "INACTIVE"
export type SeasonType = "KEY_DATE" | "DATE_RANGE"

export type BackendSeason = {
  id: string
  name: string
  description: string
  status: SeasonStatus
  type: SeasonType
  keyDate?: string | null
  startDate?: string | null
  endDate?: string | null
  minimumNights: number
}

export type SeasonUpsertBody = {
  name: string
  description: string
  type: SeasonType
  keyDate?: string | null
  startDate?: string | null
  endDate?: string | null
  minimumNights: number
}

export async function listSeasonsService() {
  return apiFetch<BackendSeason[]>("/api/season", { auth: true })
}

export async function createSeasonService(body: SeasonUpsertBody) {
  return apiFetch<BackendSeason>("/api/season", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateSeasonService(id: string, body: SeasonUpsertBody) {
  return apiFetch<BackendSeason>(`/api/season/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateSeasonStatusService(
  id: string,
  status: SeasonStatus
) {
  return apiFetch<{}>(`/api/season/update_status/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status }),
  })
}

// Necesitas crear este endpoint público en backend.
// Puede llamarse /api/season/public o /api/season/active.
export async function listActiveSeasonsPublicService() {
  return apiFetch<BackendSeason[]>("/api/season")
}