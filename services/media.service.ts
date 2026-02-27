//services/media.service.ts

import { authStorage } from "@/lib/auth-storage"

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "")

type UploadMediaResponse = {
  ok: boolean
  message: string
  data: {
    ids: string[]
    items: { id: string; url: string }[]
  }
}

export async function uploadMediaService(files: File[]) {
  if (!API_BASE) throw new Error("NEXT_PUBLIC_API_URL está vacío")

  const fd = new FormData()
  for (const f of files) fd.append("files", f)

  const access = authStorage.getAccess()

  const res = await fetch(`${API_BASE}/api/media/uploads`, {
    method: "POST",
    headers: access ? { Authorization: `Bearer ${access}` } : undefined,
    body: fd, 
  })

  const json = (await res.json().catch(() => null)) as UploadMediaResponse | null

  if (!res.ok || !json?.ok) {
    throw new Error(json?.message || `Error ${res.status} subiendo imágenes`)
  }

  // ✅ DEVUELVE SOLO data (ids e items)
  return json.data
}