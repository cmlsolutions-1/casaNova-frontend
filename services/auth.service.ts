//services/auth.service.ts
import { apiFetch } from "@/lib/api"
import { authStorage } from "@/lib/auth-storage"

export async function loginService(email: string, password: string) {
  const data = await apiFetch<{ accesToken: string; refreshToken: string }>(
    "api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email, password }),
    },
  )
  authStorage.setTokens(data.accesToken, data.refreshToken)
  return data
}

export async function logoutService() {
  // tu backend requiere Bearer
  await apiFetch("api/auth/logout", { method: "POST", auth: true })
  authStorage.clear()
}

// REFRESH SERVICE
export async function refreshService() {
  const refreshToken = authStorage.getRefresh()

  if (!refreshToken) {
    throw new Error("No hay refresh token disponible")
  }

  const data = await apiFetch<{ accesToken: string; refreshToken: string }>(
    "/api/auth/refresh",
    {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    },
  )

  authStorage.setTokens(data.accesToken, data.refreshToken)

  return data
}

