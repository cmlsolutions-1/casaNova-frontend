//services/service.service.ts
import { apiFetch } from "@/lib/api"

export type ServiceStatus = "ACTIVE" | "INACTIVE"
export type ServiceBillingType = "FIXED" | "HOURLY"

export type BackendService = {
  id: string
  name: string
  description: string
  price: number
  status: ServiceStatus
  billingType: ServiceBillingType
}

export type CreateServiceBody = {
  name: string
  description: string
  price: number
  billingType: ServiceBillingType
}

export async function listServicesService() {
  return apiFetch<BackendService[]>("/api/service", { auth: true })
}

export async function createServiceService(body: CreateServiceBody) {
  return apiFetch<BackendService>("/api/service", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateServiceService(id: string, body: CreateServiceBody) {
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
