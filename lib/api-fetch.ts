//lib/api-fetch.ts

//esto es en el real el otro que esta abajo es el de desarrollo, el otro es el que se sube a producción, el de desarrollo tiene un error que no maneja bien los errores del backend, el de producción si lo hace, por eso se hizo este cambio, para que el de desarrollo sea igual al de producción y así evitar confusiones
type ApiFetchOptions = RequestInit & {
  auth?: boolean
}

function joinUrl(base: string, path: string) {
  const b = (base ?? "").replace(/\/+$/, "")
  const p = (path ?? "").replace(/^\/+/, "")
  return `${b}/${p}`
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || ""
  const url = baseUrl ? joinUrl(baseUrl, path) : `/${path.replace(/^\/+/, "")}`

  const headers = new Headers(options.headers)

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  let res: Response

  try {
    res = await fetch(url, { ...options, headers })
  } catch (error: any) {
    throw new Error(`No se pudo conectar con ${url}. Verifica backend, NEXT_PUBLIC_API_URL o CORS. Detalle: ${error?.message || "Failed to fetch"}`)
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`)
  }

  return data as T
}
 


