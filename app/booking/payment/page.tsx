"use client"

import React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CreditCard, Building2, Banknote, ArrowLeft, Lock, Shield } from "lucide-react"
import { cn } from "@/lib/utils"

type PayMethod = "card" | "pse" | "cash"

export default function BookingPaymentPage() {
  const router = useRouter()
  const { booking, services, createReservation } = useBooking()
  const [method, setMethod] = useState<PayMethod>("card")
  const [loading, setLoading] = useState(false)

  const { searchParams: sp, selectedRoom: room, selectedServices } = booking

  useEffect(() => {
    if (!room || !sp || !booking.guestInfo) {
      router.push("/")
    }
  }, [room, sp, booking.guestInfo, router])

  if (!room || !sp) return null

  const start = new Date(sp.startDate)
  const end = new Date(sp.endDate)
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  const svcTotal = selectedServices.reduce((sum, s) => {
    const svc = services.find((sv) => sv.id === s.serviceId)
    return sum + (svc ? svc.price * s.amount : 0)
  }, 0)
  const grandTotal = room.price * nights + svcTotal

  const handlePay = async () => {
    setLoading(true)
    // Simulate payment delay
    await new Promise((r) => setTimeout(r, 2000))
    const resId = createReservation({ method })
    setLoading(false)
    router.push(`/booking/success?id=${resId}`)
  }

  const methods: { id: PayMethod; label: string; icon: React.ElementType; desc: string }[] = [
    { id: "card", label: "Tarjeta de Credito", icon: CreditCard, desc: "Visa, Mastercard, Amex" },
    { id: "pse", label: "PSE / Transferencia", icon: Building2, desc: "Transferencia bancaria" },
    { id: "cash", label: "Efectivo", icon: Banknote, desc: "Pago en recepcion" },
  ]

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl mb-2">
        Metodo de Pago
      </h1>
      <p className="text-muted-foreground mb-8">
        Seleccione como desea realizar el pago de su reserva.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Method selection */}
          <div className="grid gap-3 sm:grid-cols-3">
            {methods.map((m) => {
              const Icon = m.icon
              return (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={cn(
                    "rounded-2xl border-2 p-4 text-left transition-all",
                    method === m.id
                      ? "border-accent bg-accent/5 shadow-lg shadow-accent/10"
                      : "border-border bg-card hover:border-accent/40",
                  )}
                >
                  <Icon className={cn("h-6 w-6 mb-2", method === m.id ? "text-accent" : "text-muted-foreground")} />
                  <p className="text-sm font-bold text-card-foreground">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </button>
              )
            })}
          </div>

          {/* Card form mock */}
          {method === "card" && (
            <div className="rounded-2xl bg-card p-6 shadow">
              <h3 className="mb-4 font-bold text-card-foreground">Datos de la Tarjeta</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <Label htmlFor="cardNumber">Numero de tarjeta</Label>
                  <Input id="cardNumber" placeholder="4242 4242 4242 4242" className="mt-1.5 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="cardExp">Fecha de expiracion</Label>
                  <Input id="cardExp" placeholder="MM/AA" className="mt-1.5 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="cardCvv">CVV</Label>
                  <Input id="cardCvv" placeholder="123" className="mt-1.5 rounded-xl" />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cardName">Nombre en la tarjeta</Label>
                  <Input id="cardName" placeholder="JUAN PEREZ" className="mt-1.5 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {method === "pse" && (
            <div className="rounded-2xl bg-card p-6 shadow">
              <h3 className="mb-4 font-bold text-card-foreground">Transferencia PSE</h3>
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="bank">Banco</Label>
                  <Input id="bank" placeholder="Seleccione su banco" className="mt-1.5 rounded-xl" />
                </div>
                <div>
                  <Label htmlFor="accountType">Tipo de cuenta</Label>
                  <Input id="accountType" placeholder="Ahorros / Corriente" className="mt-1.5 rounded-xl" />
                </div>
              </div>
            </div>
          )}

          {method === "cash" && (
            <div className="rounded-2xl bg-card p-6 shadow">
              <div className="text-center py-6">
                <Banknote className="mx-auto h-12 w-12 text-accent mb-3" />
                <h3 className="font-bold text-card-foreground">Pago en Efectivo</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
                  Su reserva quedara confirmada una vez realice el pago en la recepcion del hotel
                  al momento de su llegada.
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-green-600" />
            <span>Transaccion segura. Sus datos estan protegidos con encriptacion SSL.</span>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="sticky top-28 rounded-2xl bg-card p-6 shadow-lg">
            <h2 className="mb-4 font-bold text-card-foreground">Total a Pagar</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{room.name} x {nights}n</span>
                <span className="font-bold">${room.price * nights}</span>
              </div>
              {svcTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicios</span>
                  <span className="font-bold">${svcTotal}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-accent">${grandTotal}</span>
              </div>
            </div>
            <Button
              onClick={handlePay}
              disabled={loading}
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl py-3 h-auto text-base font-bold"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent-foreground border-t-transparent" />
                  Procesando...
                </span>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  Pagar ${grandTotal}
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          onClick={() => router.push("/booking/confirm")}
          className="rounded-xl px-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    </div>
  )
}
