"use client"

import React from "react"

import { usePathname } from "next/navigation"
import { PublicHeader } from "@/components/public-header"
import { PublicFooter } from "@/components/public-footer"
import { cn } from "@/lib/utils"

const steps = [
  { path: "/booking/services", label: "Servicios", num: 1 },
  { path: "/booking/guest", label: "Datos", num: 2 },
  { path: "/booking/confirm", label: "Confirmar", num: 3 },
  { path: "/booking/payment", label: "Pago", num: 4 },
  { path: "/booking/success", label: "Listo", num: 5 },
]

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const currentIdx = steps.findIndex((s) => pathname.startsWith(s.path))

  return (
    <main>
      <PublicHeader />
      <div className="pt-24 pb-12 px-4">
        <div className="mx-auto max-w-4xl">
          {/* Step indicator */}
          <nav className="mb-10 flex items-center justify-center gap-1 overflow-x-auto" aria-label="Pasos de reserva">
            {steps.map((step, i) => {
              const isActive = i === currentIdx
              const isDone = i < currentIdx
              return (
                <div key={step.path} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold transition-all",
                        isActive && "bg-accent text-accent-foreground shadow-lg shadow-accent/30",
                        isDone && "bg-accent/20 text-accent",
                        !isActive && !isDone && "bg-secondary text-muted-foreground",
                      )}
                    >
                      {step.num}
                    </div>
                    <span
                      className={cn(
                        "mt-1 text-[10px] font-semibold uppercase tracking-wider",
                        isActive ? "text-accent" : "text-muted-foreground",
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < steps.length - 1 && (
                    <div
                      className={cn(
                        "mx-2 h-0.5 w-8 rounded-full md:w-14",
                        i < currentIdx ? "bg-accent" : "bg-border",
                      )}
                    />
                  )}
                </div>
              )
            })}
          </nav>
          {children}
        </div>
      </div>
      <PublicFooter />
    </main>
  )
}
