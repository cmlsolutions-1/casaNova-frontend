//components/admin/AdminGuard.tsx
"use client"

import React, { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { canAccessRoute } from "@/lib/rbac"

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { hydrated, adminAuth } = useBooking()

  useEffect(() => {
    if (!hydrated) return

    // no autenticado
    if (!adminAuth.isAuthenticated) {
      router.replace("/admin/login")
      return
    }

    const role = adminAuth.user?.role
    if (role && !canAccessRoute(role, pathname)) {
      router.replace("/admin")
    }
  }, [hydrated, adminAuth.isAuthenticated, adminAuth.user?.role, pathname, router])

  // Mientras hidrata, NO redirijas, solo muestra loading
  if (!hydrated) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  // Si ya hidrató y no está autenticado, el effect ya redirige
  if (!adminAuth.isAuthenticated) return null

  return <>{children}</>
}
