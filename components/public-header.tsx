//components/public-header.tsx

"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu, X, Hotel } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

export function PublicHeader() {
  const [mobileOpen, setMobileOpen] = useState(false)

  const links = [
    { href: "/#rooms", label: "Habitaciones" },
    { href: "/#services", label: "Servicios" },
    { href: "/#search", label: "Reservar" },
    { href: "/admin/login", label: "Admin" },
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-dark">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
        <div className="relative h-10 w-10">
            <Image
              src="/LOGO.png"
              alt="Casa Nova Hotel Campestre"
              fill
              className="object-contain"
              priority
            />
          </div>

          <span className="font-serif text-xl font-bold tracking-wide text-white">
            Casa Nova
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm font-medium tracking-wide text-white/80 transition-colors hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
          <Link href="/#search">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-6 text-sm font-semibold">
              Reservar Ahora
            </Button>
          </Link>
        </nav>

        <button
          type="button"
          className="text-white md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="glass-dark border-t border-white/10 md:hidden">
          <nav className="flex flex-col gap-1 px-4 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-accent"
                onClick={() => setMobileOpen(false)}
              >
                {l.label}
              </Link>
            ))}
            <Link href="/#search" onClick={() => setMobileOpen(false)}>
              <Button className="mt-2 w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-semibold">
                Reservar Ahora
              </Button>
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
