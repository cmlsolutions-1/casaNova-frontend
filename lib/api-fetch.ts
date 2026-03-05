type ApiFetchOptions = RequestInit & {
  auth?: boolean
}

function joinUrl(base: string, path: string) {
  const b = (base ?? "").replace(/\/+$/, "") // quita slash al final
  const p = (path ?? "").replace(/^\/+/, "") // quita slash al inicio
  return `${b}/${p}`
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || "" 
  // Si baseUrl = "" => pega al mismo host (localhost:3000)
  const url = baseUrl ? joinUrl(baseUrl, path) : `/${path.replace(/^\/+/, "")}`

  const headers = new Headers(options.headers)

  // si manejas auth, aquí agregarías token si options.auth = true
  // if (options.auth) headers.set("Authorization", `Bearer ${token}`)

  if (!headers.has("Content-Type")) headers.set("Content-Type", "application/json")

  const res = await fetch(url, { ...options, headers })
  const data = await res.json().catch(() => null)

  if (!res.ok) {
    // deja pasar el shape del backend si existe
    throw new Error(data?.message || `HTTP ${res.status}`)
  }

  return data as T
}