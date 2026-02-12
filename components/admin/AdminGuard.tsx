"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { canAccessRoute } from "@/lib/rbac"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { adminAuth } = useBooking()

  useEffect(() => {
    const role = adminAuth.user?.role

    // no autenticado
    if (!adminAuth.isAuthenticated) {
      router.replace("/admin/login")
      return
    }

    // autenticado pero sin permiso
    if (role && !canAccessRoute(role, pathname)) {
      router.replace("/admin") // o /admin/unauthorized si quieres
    }
  }, [adminAuth, pathname, router])

  return <>{children}</>
}
