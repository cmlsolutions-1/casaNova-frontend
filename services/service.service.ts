//services/service.service.ts

import { apiFetch } from "@/lib/api"

export type ServiceStatus = "ACTIVE" | "INACTIVE"
export type ServiceBillingType = "FIXED" | "HOURLY"
export type ServiceType = "STAY" | "DAY_PASS"

export type BackendImage = { 
  id: string; 
  url: string;
  isCover?: boolean;
}

export type BackendService = {
  id: string
  name: string
  description: string
  decription?: string
  price: number
  status: ServiceStatus
  billingType: ServiceBillingType
  type: ServiceType
  images: BackendImage[]
}

function normalizeService(s: any): BackendService {
  return {
    ...s,
    description: s.description ?? s.decription ?? "",
    type: s.type ?? "STAY",
    images: Array.isArray(s.images) ? s.images : [],
  }
}

export type ServiceUpsertBody = {
  name: string
  description: string
  decription?: string
  price: number
  billingType: ServiceBillingType
  type: ServiceType
  imagesIds?: string[]
  coverImageId?: string
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

//para usar en el preview de los servicios, en la pantalla de booking, no requiere auth porque es info publica
export async function listServicesPublicService() {
  return apiFetch<BackendService[]>("/api/service") // sin auth
}
