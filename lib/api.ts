// lib/api.ts
import { authStorage } from "@/lib/auth-storage"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

type ApiResponse<T> = {
  ok: boolean
  message: string
  data: T
  errors: any
  meta?: any
}

function buildHeaders(initHeaders?: HeadersInit, extra?: Record<string, string>) {
  const h = new Headers(initHeaders)
  h.set("Content-Type", "application/json")
  if (extra) for (const [k, v] of Object.entries(extra)) h.set(k, v)
  return h
}

async function safeJson(res: Response) {
  const ct = res.headers.get("content-type") || ""
  if (!ct.includes("application/json")) {
    const text = await res.text().catch(() => "")
    return { __nonJson: true, text }
  }
  return res.json().catch(() => ({ __badJson: true }))
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit & { auth?: boolean } = {},
): Promise<T> {
  if (!API_BASE) {
    throw new Error(
      "NEXT_PUBLIC_API_URL está vacío. Crea .env.local en el frontend con NEXT_PUBLIC_API_URL=http://localhost:3000 y reinicia Next.",
    )
  }

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`

  const access = authStorage.getAccess()
  const authHeaders =
    init.auth && access ? { Authorization: `Bearer ${access}` } : undefined

  // 1er intento
  const res = await fetch(url, {
    ...init,
    headers: buildHeaders(init.headers, authHeaders),
  })

  const json = (await safeJson(res)) as any

  if (res.ok && json?.ok) return json.data as T

  // refresh 1 vez (solo si 401 + auth)
  if (res.status === 401 && init.auth) {
    const refreshToken = authStorage.getRefresh()
    if (!refreshToken) throw new Error("Sesión expirada")

    const refreshRes = await fetch(`${API_BASE}/api/auth/refresh`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify({ refreshToken }),
    })

    const refreshJson = (await safeJson(refreshRes)) as ApiResponse<{
      accesToken: string
      refreshToken: string
    }> & any

    if (!refreshRes.ok || !refreshJson?.ok) {
      authStorage.clear()
      throw new Error(refreshJson?.message || "Sesión expirada")
    }

    authStorage.setTokens(refreshJson.data.accesToken, refreshJson.data.refreshToken)

    // reintento
    const retryRes = await fetch(url, {
      ...init,
      headers: buildHeaders(init.headers, {
        Authorization: `Bearer ${refreshJson.data.accesToken}`,
      }),
    })

    const retryJson = (await safeJson(retryRes)) as any

    if (retryRes.ok && retryJson?.ok) return retryJson.data as T

    throw new Error(retryJson?.message || `Error ${retryRes.status} en ${url}`)
  }

  // mensaje de error claro
  if (json?.__nonJson) {
    throw new Error(`Respuesta no JSON (${res.status}) en ${url}: ${json.text?.slice(0, 200)}`)
  }

  throw new Error(json?.message || `Error ${res.status} en ${url}`)
}
