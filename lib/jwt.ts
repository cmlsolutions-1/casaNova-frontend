// lib/jwt.ts
export type JwtPayload = {
    sub?: string
    role?: "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE"
    sessionId?: string
    iat?: number
    exp?: number
    [k: string]: any
  }
  
  function base64UrlDecode(input: string) {
    const pad = "=".repeat((4 - (input.length % 4)) % 4)
    const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/")
    const decoded = atob(base64)
    try {
      return decodeURIComponent(
        decoded
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      )
    } catch {
      return decoded
    }
  }
  
  export function decodeJwt(token: string): JwtPayload | null {
    try {
      const parts = token.split(".")
      if (parts.length < 2) return null
      return JSON.parse(base64UrlDecode(parts[1]))
    } catch {
      return null
    }
  }
  
  export function isExpired(token: string) {
    const p = decodeJwt(token)
    if (!p?.exp) return false
    return Date.now() >= p.exp * 1000
  }
  