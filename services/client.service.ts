//services/client.service.ts
import { apiFetch } from "@/lib/api-fetch"

export type BackendClient = {
  id: string
  name: string
  email: string
  phone: any
  status: "ACTIVE" | "INACTIVE"
  documentType: string
  documentNumber: string
  address: string
  birthDate: string
}

export type UpsertClientBody = {
  name: string
  email: string
  phone: string
  documentType: string
  documentNumber: string
  address: string
  birthDate: string
}

export async function upsertClientPublicService(body: UpsertClientBody) {
  return apiFetch<any>("/api/client", {
    method: "POST",
    body: JSON.stringify(body),
  })
}