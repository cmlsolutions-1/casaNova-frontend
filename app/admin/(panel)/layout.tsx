"use client"

import React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { AdminSidebar } from "@/components/admin-sidebar"

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const { adminAuth } = useBooking()
  const router = useRouter()

  useEffect(() => {
    if (!adminAuth.isAuthenticated) {
      router.push("/admin/login")
    }
  }, [adminAuth.isAuthenticated, router])

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
