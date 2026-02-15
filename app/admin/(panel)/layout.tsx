//app/admin/(panel)/layout.tsx

"use client"

import React, { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { AdminSidebar } from "@/components/admin-sidebar"
import { canAccessRoute } from "@/lib/rbac"

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { adminAuth, hydrated } = useBooking()
  const router = useRouter()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)


  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !hydrated) return

    if (!adminAuth.isAuthenticated) {
      router.replace("/admin/login")
      return
    }

    const role = adminAuth.user?.role
    if (!role) {
      router.replace("/admin/login")
      return
    }

    if (!canAccessRoute(role, pathname)) {
      router.replace("/admin")
    }
  }, [mounted, hydrated, adminAuth.isAuthenticated, adminAuth.user?.role, pathname, router])

  // Mientras no esté montado, render SIEMPRE lo mismo
  if (!mounted || !hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    )
  }

  if (!adminAuth.isAuthenticated) return null

  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="lg:pl-64">
        <div className="p-4 pt-16 lg:p-8 lg:pt-8">{children}</div>
      </main>
    </div>
  )
}
