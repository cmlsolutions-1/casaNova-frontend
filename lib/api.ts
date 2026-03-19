import { authStorage } from "@/lib/auth-storage"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

type ApiResponse<T> = {
  ok: boolean
  message: string
  data: T
  errors: any
  meta?: any
}

type ApiFetchOptions = RequestInit & {
  auth?: boolean
  rawResponse?: boolean
}

function buildHeaders(
  initHeaders?: HeadersInit,
  extra?: Record<string, string>,
  opts?: { isFormData?: boolean },
) {
  const h = new Headers(initHeaders)

  if (!opts?.isFormData && !h.has("Content-Type")) {
    h.set("Content-Type", "application/json")
  }

  const shouldUseNgrokHeader =
    API_BASE.includes("ngrok-free.app") || API_BASE.includes("trycloudflare.com")

  if (shouldUseNgrokHeader && !h.has("ngrok-skip-browser-warning")) {
    h.set("ngrok-skip-browser-warning", "1")
  }

  if (extra) {
    for (const [k, v] of Object.entries(extra)) h.set(k, v)
  }

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

function extractErrorMessage(json: any, status: number, url: string) {
  if (!json) return `Error ${status} en ${url}`

  if (Array.isArray(json?.errors) && json.errors.length > 0) {
    const first = json.errors[0]
    if (typeof first === "string") return first
    if (first?.message) return first.message
  }

  if (typeof json?.errors === "string") return json.errors
  if (json?.message) return json.message

  return `Error ${status} en ${url}`
}

export async function apiFetch<T>(
  path: string,
  init: ApiFetchOptions = {},
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

  const isFormData =
    typeof FormData !== "undefined" && init.body instanceof FormData

  const doFetch = async (token?: string) => {
    const headers = buildHeaders(
      init.headers,
      init.auth
        ? {
            Authorization: `Bearer ${token || access || ""}`,
          }
        : authHeaders,
      { isFormData },
    )

    const response = await fetch(url, {
      ...init,
      headers,
    })

    const json = await safeJson(response)
    return { response, json }
  }

  let result: { response: Response; json: any }

  try {
    result = await doFetch()
  } catch (error: any) {
    throw new Error(
      `No se pudo conectar con ${url}. Verifica backend, NEXT_PUBLIC_API_URL o CORS. Detalle: ${
        error?.message || "Failed to fetch"
      }`
    )
  }

  const { response, json } = result

  if (response.ok) {
    // Si el backend responde envuelto con { ok, data, ... }
    if (json?.ok !== undefined) {
      return (init.rawResponse ? json : json.data) as T
    }

    // Si responde directamente un array u objeto
    return json as T
  }

  if (response.status === 401 && init.auth) {
    const refreshToken = authStorage.getRefresh()

    if (!refreshToken) {
      authStorage.clear()
      throw new Error("Sesión expirada")
    }

    const refreshUrl = `${API_BASE}/api/auth/refresh`

    let refreshResponse: Response
    let refreshJson: any

    try {
      refreshResponse = await fetch(refreshUrl, {
        method: "POST",
        headers: buildHeaders(undefined, undefined, { isFormData: false }),
        body: JSON.stringify({ refreshToken }),
      })

      refreshJson = await safeJson(refreshResponse)
    } catch (error: any) {
      authStorage.clear()
      throw new Error(
        `No se pudo refrescar la sesión. Detalle: ${error?.message || "Failed to fetch"}`
      )
    }

    if (!refreshResponse.ok || !refreshJson?.ok) {
      authStorage.clear()
      throw new Error(
        extractErrorMessage(refreshJson, refreshResponse.status, refreshUrl)
      )
    }

    authStorage.setTokens(
      refreshJson.data.accesToken,
      refreshJson.data.refreshToken,
    )

    let retryResult: { response: Response; json: any }

    try {
      retryResult = await doFetch(refreshJson.data.accesToken)
    } catch (error: any) {
      throw new Error(
        `No se pudo completar la solicitud después del refresh. Detalle: ${
          error?.message || "Failed to fetch"
        }`
      )
    }

    if (!retryResult.response.ok) {
      throw new Error(
        extractErrorMessage(retryResult.json, retryResult.response.status, url)
      )
    }

    if (retryResult.json?.ok !== undefined) {
      return (init.rawResponse ? retryResult.json : retryResult.json.data) as T
    }

    return retryResult.json as T
  }

  if (json?.__nonJson) {
    throw new Error(
      `Respuesta no JSON (${response.status}) en ${url}: ${json.text?.slice(0, 200)}`
    )
  }

  throw new Error(extractErrorMessage(json, response.status, url))
}