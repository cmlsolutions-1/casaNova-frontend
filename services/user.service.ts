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

export async function listUsersService() {
  return apiFetch<BackendUser[]>("/api/user", { auth: true })
}

export async function createUserService(body: CreateUserBody) {
  return apiFetch<BackendUser>("/api/user", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}
