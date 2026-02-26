//services/service.service.ts
import { apiFetch } from "@/lib/api"

export type ServiceStatus = "ACTIVE" | "INACTIVE"
export type ServiceBillingType = "FIXED" | "HOURLY"

export type BackendService = {
  id: string
  name: string
  description: string
  decription?: string
  price: number
  status: ServiceStatus
  billingType: ServiceBillingType

  // GET
  images: string[]
}

export type ServiceUpsertBody = {
  name: string
  description: string
  decription?: string
  price: number
  billingType: ServiceBillingType
  imagesIds: string[]
}

export async function listServicesService() {
  return apiFetch<BackendService[]>("/api/service", { auth: true })
}

export async function createServiceService(body: ServiceUpsertBody) {
  return apiFetch<BackendService>("/api/service", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateServiceService(id: string, body: ServiceUpsertBody) {
  return apiFetch<BackendService>(`/api/service/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateServiceStatusService(id: string, status: ServiceStatus) {
  return apiFetch(`/api/service/update_status/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify({ status }),
  })
}

export async function getServiceService(id: string) {
  return apiFetch<BackendService>(`/api/service/${id}`, { auth: true })
}
