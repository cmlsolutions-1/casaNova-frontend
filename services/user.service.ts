//services/user.service.ts
import { apiFetch } from "@/lib/api"
import type { Role } from "@/lib/rbac"


export type BackendUser = {
  id: string
  name: string
  email: string
  phone: string
  status: "ACTIVE" | "INACTIVE"
  role: Role
}

export type CreateUserBody = {
  name: string
  email: string
  phone: string
  password: string
  role: Role
}

export type UpdateUserBody = {
  name: string
  email: string
  phone: string
  role: Role
}

export async function listUsersService() {
  return apiFetch<BackendUser[]>("/api/user", { auth: true })
}

export async function getUserByIdService(id: string) {
  return apiFetch<BackendUser>(`/api/user/${id}`, { auth: true })
}

export async function createUserService(body: CreateUserBody) {
  return apiFetch<BackendUser>("/api/user", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function updateUserService(id: string, body: UpdateUserBody) {
  return apiFetch<BackendUser>(`/api/user/${id}`, {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  })
}

export async function activateUserService(id: string) {
  return apiFetch<{}>(`/api/user/active/${id}`, {
    method: "PUT",
    auth: true,
  })
}

// INACTIVAR = DELETE
export async function deactivateUserService(id: string) {
  return apiFetch<{}>(`/api/user/${id}`, {
    method: "DELETE",
    auth: true,
  })
}
