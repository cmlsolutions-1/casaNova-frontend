//lib/auth-storage.ts
const ACCESS_KEY = "hotel_access_token"
const REFRESH_KEY = "hotel_refresh_token"

export const authStorage = {
  getAccess() {
    if (typeof window === "undefined") return null
    return localStorage.getItem(ACCESS_KEY)
  },
  getRefresh() {
    if (typeof window === "undefined") return null
    return localStorage.getItem(REFRESH_KEY)
  },
  setTokens(accessToken: string, refreshToken: string) {
    if (typeof window === "undefined") return
    localStorage.setItem(ACCESS_KEY, accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  },
  clear() {
    if (typeof window === "undefined") return
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },
}
