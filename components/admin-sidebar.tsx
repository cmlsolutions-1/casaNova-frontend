//components/admin-sidebar.tsx

"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import {
  LayoutDashboard,
  BedDouble,
  Sparkles,
  CalendarCheck,
  Users,
  LogOut,
  Hotel,
  Menu,
  X,
} from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { canAccessRoute, ROLE_LABEL } from "@/lib/rbac"


const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Habitaciones", icon: BedDouble },
  { href: "/admin/services", label: "Servicios", icon: Sparkles },
  { href: "/admin/reservations", label: "Reservas", icon: CalendarCheck },
  { href: "/admin/users", label: "Usuarios", icon: Users },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { adminAuth, logout } = useBooking()
  const [mobileOpen, setMobileOpen] = useState(false)

  const role = adminAuth.user?.role
  const visibleLinks = role ? adminLinks.filter((l) => canAccessRoute(role, l.href)) : []


  const handleLogout = () => {
    logout()
    router.push("/admin/login")
  }

  const sidebar = (
    <div className="flex h-full flex-col bg-primary text-primary-foreground">
      <div className="flex items-center gap-3 px-6 py-5 border-b border-primary-foreground/10">
        <Hotel className="h-7 w-7 text-accent" />
        <div>
          <p className="font-serif text-lg font-semibold leading-tight">Casa Nova</p>
          <p className="text-xs text-primary-foreground/60">
          {adminAuth.user?.role ? ROLE_LABEL[adminAuth.user.role] : ""}
        </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {visibleLinks.map((link) => {
          const active = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              )}
            >
              <link.icon className="h-4 w-4" />
              {link.label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-primary-foreground/10 px-3 py-4 space-y-3">
        <div className="px-3 text-xs text-primary-foreground/50">
          {adminAuth.user?.name}
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/10"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesion
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        type="button"
        className="fixed top-4 left-4 z-50 rounded-lg bg-primary p-2 text-primary-foreground lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle menu"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
          onKeyDown={() => {}}
          role="presentation"
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-200 lg:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-64">
        {sidebar}
      </aside>
    </>
  )
}
