"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, ArrowLeft, User } from "lucide-react"
import type { GuestInfo } from "@/lib/mock-data"

export default function BookingGuestPage() {
  const router = useRouter()
  const { booking, setGuestInfo } = useBooking()

  const [form, setForm] = useState<GuestInfo>({
    name: "",
    email: "",
    phone: "",
    documentNumber: "",
    documentType: "CC",
    address: "",
    birthDay: "",
  })
  const [errors, setErrors] = useState<Partial<Record<keyof GuestInfo, string>>>({})

  useEffect(() => {
    if (!booking.selectedRoom) {
      router.push("/")
      return
    }
    if (booking.guestInfo) {
      setForm(booking.guestInfo)
    }
  }, [booking.selectedRoom, booking.guestInfo, router])

  const validate = (): boolean => {
    const errs: Partial<Record<keyof GuestInfo, string>> = {}
    if (!form.name.trim()) errs.name = "Nombre requerido"
    if (!form.email.trim()) errs.email = "Email requerido"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = "Email invalido"
    if (!form.phone.trim()) errs.phone = "Telefono requerido"
    else if (!/^[\d\s+()-]{7,20}$/.test(form.phone)) errs.phone = "Telefono invalido"
    if (!form.documentNumber.trim()) errs.documentNumber = "Documento requerido"
    if (!form.address.trim()) errs.address = "Direccion requerida"
    if (!form.birthDay) errs.birthDay = "Fecha de nacimiento requerida"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleContinue = () => {
    if (!validate()) return
    setGuestInfo(form)
    router.push("/booking/confirm")
  }

  const updateField = (field: keyof GuestInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div>
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent">
          <User className="h-6 w-6 text-accent-foreground" />
        </div>
        <div>
          <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
            Datos del Huesped
          </h1>
          <p className="text-sm text-muted-foreground">Complete su informacion personal</p>
        </div>
      </div>

      <div className="rounded-2xl bg-card p-6 shadow-lg">
        <div className="grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="name">Nombre completo *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              placeholder="Juan Carlos Perez"
              className="mt-1.5 rounded-xl"
            />
            {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
          </div>

          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="juan@email.com"
              className="mt-1.5 rounded-xl"
            />
            {errors.email && <p className="mt-1 text-xs text-destructive">{errors.email}</p>}
          </div>

          <div>
            <Label htmlFor="phone">Telefono *</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="+57 300 123 4567"
              className="mt-1.5 rounded-xl"
            />
            {errors.phone && <p className="mt-1 text-xs text-destructive">{errors.phone}</p>}
          </div>

          <div>
            <Label>Tipo de documento *</Label>
            <Select value={form.documentType} onValueChange={(v) => updateField("documentType", v)}>
              <SelectTrigger className="mt-1.5 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CC">Cedula de Ciudadania</SelectItem>
                <SelectItem value="CE">Cedula de Extranjeria</SelectItem>
                <SelectItem value="PAS">Pasaporte</SelectItem>
                <SelectItem value="NIT">NIT</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="documentNumber">Numero de documento *</Label>
            <Input
              id="documentNumber"
              value={form.documentNumber}
              onChange={(e) => updateField("documentNumber", e.target.value)}
              placeholder="1234567890"
              className="mt-1.5 rounded-xl"
            />
            {errors.documentNumber && <p className="mt-1 text-xs text-destructive">{errors.documentNumber}</p>}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="address">Direccion *</Label>
            <Input
              id="address"
              value={form.address}
              onChange={(e) => updateField("address", e.target.value)}
              placeholder="Calle 100 #15-30, Bogota"
              className="mt-1.5 rounded-xl"
            />
            {errors.address && <p className="mt-1 text-xs text-destructive">{errors.address}</p>}
          </div>

          <div>
            <Label htmlFor="birthDay">Fecha de nacimiento *</Label>
            <Input
              id="birthDay"
              type="date"
              value={form.birthDay}
              onChange={(e) => updateField("birthDay", e.target.value)}
              className="mt-1.5 rounded-xl"
            />
            {errors.birthDay && <p className="mt-1 text-xs text-destructive">{errors.birthDay}</p>}
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-between">
        <Button
          variant="outline"
          onClick={() => router.push("/booking/services")}
          className="rounded-xl px-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Atras
        </Button>
        <Button
          onClick={handleContinue}
          className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl px-8 py-3 h-auto font-semibold"
        >
          Continuar
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
