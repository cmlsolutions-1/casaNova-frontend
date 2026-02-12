//app/admin/(panel)/layout.tsx

"use client"

import React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { canAccessRoute } from "@/lib/rbac"

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { adminAuth } = useBooking()
  const router = useRouter()
  const pathname = usePathname()


  useEffect(() => {
    if (!adminAuth.isAuthenticated) {
      router.push("/admin/login")
      return
    }
  
    const role = adminAuth.user?.role
    const path = pathname
  
    // si por alguna razón no hay rol, lo sacas
    if (!role) {
      router.push("/admin/login")
      return
    }
  
    // si no tiene permiso para la ruta actual
    if (!canAccessRoute(role, path)) {
      router.push("/admin") // o "/admin/rooms" si prefieres
    }
  }, [adminAuth.isAuthenticated, adminAuth.user?.role, pathname, router])
  
  if (!adminAuth.isAuthenticated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Redirigiendo al login...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}
