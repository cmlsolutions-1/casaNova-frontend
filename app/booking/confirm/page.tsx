//app/booking/confirm/page.tsx

"use client"
import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CalendarDays, Users, ArrowRight, Pencil, Hotel } from "lucide-react"
import { parseISO, format } from "date-fns"
import { es } from "date-fns/locale"

import { listServicesPublicService, type BackendService } from "@/services/service.service"
import { upsertClientPublicService } from "@/services/client.service"
import { createReservationPublicService } from "@/services/reservation.service"
import { createPaymentPublicService } from "@/services/payment.service"

export default function BookingConfirmPage() {
  const router = useRouter()
  const { booking, setBookingConsents } = useBooking()
  const { searchParams: sp, selectedRooms, selectedServices, guestInfo } = booking

  const acceptedTerms = booking.consents?.acceptedTerms ?? false
  const acceptedMinorsPolicy = booking.consents?.acceptedMinorsPolicy ?? false

  const [servicesFromApi, setServicesFromApi] = useState<BackendService[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)
  

  const handleGoToMercadoPago = async () => {
  if (!sp || !guestInfo || !selectedRooms || selectedRooms.length === 0) return

  setPaying(true)
  setPayError(null)

  try {
    // 1) crear / actualizar cliente
    const clientRes = await upsertClientPublicService({
      name: guestInfo.name,
      email: guestInfo.email,
      phone: guestInfo.phone,
      documentType: guestInfo.documentType,
      documentNumber: guestInfo.documentNumber,
      address: guestInfo.address,
      birthDate: new Date(guestInfo.birthDay).toISOString(),
    })

    if (!clientRes?.ok) {
      throw new Error(clientRes?.message || "No se pudo crear/actualizar el cliente")
    }

    // 2) crear reserva
    const startISO = new Date(sp.startDate).toISOString()
    const endISO = new Date(sp.endDate).toISOString()

    const roomsPayload: Array<{
      roomId: string
      numberOfPeople: number
      children?: number
      babys?: number
      pets?: number
    }> = []

    let remainingAdults = sp.adults
    let remainingKids = sp.kids
    let remainingBabies = sp.babies
    let remainingPets = sp.pets

    for (const room of selectedRooms as any[]) {
      const capacity = Number(room.capacity ?? 0)
      let used = 0

      const roomEntry: any = {
        roomId: room.id,
      }

      const adultsHere = Math.min(remainingAdults, capacity - used)
      if (adultsHere > 0) {
        roomEntry.numberOfPeople = adultsHere
        used += adultsHere
        remainingAdults -= adultsHere
      }

      const kidsHere = Math.min(remainingKids, capacity - used)
      if (kidsHere > 0) {
        roomEntry.children = kidsHere
        used += kidsHere
        remainingKids -= kidsHere
      }

      const babiesHere = Math.min(remainingBabies, capacity - used)
      if (babiesHere > 0) {
        roomEntry.babys = babiesHere
        used += babiesHere
        remainingBabies -= babiesHere
      }

      const petsHere = Math.min(remainingPets, capacity - used)
      if (petsHere > 0) {
        roomEntry.pets = petsHere
        used += petsHere
        remainingPets -= petsHere
      }

      // solo agrega habitaciones realmente ocupadas
      if (used > 0) {
        if (roomEntry.numberOfPeople === undefined) {
          roomEntry.numberOfPeople = 0
        }
        roomsPayload.push(roomEntry)
      }
    }

    // validación extra
    if (
      remainingAdults > 0 ||
      remainingKids > 0 ||
      remainingBabies > 0 ||
      remainingPets > 0
    ) {
      throw new Error(
        "No se pudo distribuir correctamente la cantidad de huéspedes en las habitaciones seleccionadas.",
      )
    }

  const servicesPayload =
  (selectedServices ?? []).length > 0
    ? (selectedServices ?? []).map((s: any) => ({
        serviceId: s.serviceId,
        amount: s.amount,
      }))
    : undefined

  const reservationBody = {
    startDate: startISO,
    endDate: endISO,
    clientDocument: guestInfo.documentNumber,
    rooms: roomsPayload,
    ...(servicesPayload ? { services: servicesPayload } : {}),
  }

  console.log("BODY RESERVATION =>", reservationBody)

  const reservationRes = await createReservationPublicService(reservationBody)

    if (!reservationRes?.ok) {
      throw new Error(reservationRes?.message || "No se pudo crear la reserva")
    }

    const reservationId = reservationRes.data?.id
    if (!reservationId) {
      throw new Error("El backend no devolvió id de reserva")
    }

    // 3) crear pago mercado pago
    const paymentRes = await createPaymentPublicService({
      reservationId,
    })

    if (!paymentRes?.ok) {
      throw new Error(paymentRes?.message || "No se pudo generar el link de pago")
    }

    const checkoutUrl =
      paymentRes.data?.initPoint || paymentRes.data?.sandboxInitPoint

    if (!checkoutUrl) {
      throw new Error("No se recibió el link de pago de Mercado Pago")
    }

    // 4) redirigir a mercado pago
    window.location.href = checkoutUrl
  } catch (e: any) {
    console.error("Error en proceso de pago:", e)
    setPayError(e?.message ?? "Ocurrió un error redirigiendo al pago")
    setPaying(false)
  }
}

  useEffect(() => {
    if (!sp || !guestInfo || !selectedRooms || selectedRooms.length === 0) {
      router.push("/")
      return
    }

    let alive = true
    ;(async () => {
      try {
        setLoadingServices(true)
        const data = await listServicesPublicService()
        if (!alive) return
        setServicesFromApi(Array.isArray(data) ? data : [])
      } finally {
        if (alive) setLoadingServices(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [sp, guestInfo, selectedRooms, router])

  const nights = useMemo(() => {
    if (!sp) return 0
    const start = parseISO(sp.startDate)
    const end = parseISO(sp.endDate)
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  }, [sp])

  if (!sp || !guestInfo || !selectedRooms || selectedRooms.length === 0) return null

  const prettyRange = (() => {
    try {
      return `${format(parseISO(sp.startDate), "dd MMM yyyy", { locale: es })} - ${format(parseISO(sp.endDate), "dd MMM yyyy", { locale: es })}`
    } catch {
      return `${sp.startDate} - ${sp.endDate}`
    }
  })()

  const roomsPerNight = selectedRooms.reduce((sum: number, r: any) => sum + (r.price ?? 0), 0)
  const roomsTotal = roomsPerNight * nights

  const svcDetails = (selectedServices ?? []).map((s) => {
    const svc = servicesFromApi.find((sv) => sv.id === s.serviceId)
    return {
      id: s.serviceId,
      name: svc?.name ?? "Servicio",
      unitPrice: svc?.price ?? 0,
      amount: s.amount,
      total: (svc?.price ?? 0) * s.amount,
    }
  })

  const svcTotal = svcDetails.reduce((sum, s) => sum + s.total, 0)
  const grandTotal = roomsTotal + svcTotal

  const totalPeople = sp.adults + sp.kids + sp.babies
  const capacityTotal = selectedRooms.reduce((sum: number, r: any) => sum + (r.capacity ?? 0), 0)

  const canProceedToPay = acceptedTerms && acceptedMinorsPolicy && !paying

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl mb-2">
        Confirmar Reserva
      </h1>
      <p className="text-muted-foreground mb-8">
        Revise los detalles de su reserva antes de proceder al pago.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {/* Dates & guests */}
          <div className="rounded-2xl bg-card p-5 shadow">
            <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-muted-foreground">
              Fechas y Huéspedes
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3">
                <CalendarDays className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Estancia</p>
                  <p className="text-sm font-bold">{prettyRange}</p>
                  <p className="text-xs text-muted-foreground">
                    {nights} noche{nights > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-xs text-muted-foreground">Huéspedes</p>
                  <p className="text-sm font-bold">
                    {sp.adults} adulto{sp.adults > 1 ? "s" : ""}
                    {sp.kids > 0 ? `, ${sp.kids} niño${sp.kids > 1 ? "s" : ""}` : ""}
                    {sp.babies > 0 ? `, ${sp.babies} bebé${sp.babies > 1 ? "s" : ""}` : ""}
                    {sp.pets > 0 ? `, ${sp.pets} mascota${sp.pets > 1 ? "s" : ""}` : ""}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Capacidad seleccionada: {capacityTotal} (para {totalPeople})
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Rooms */}
          <div className="rounded-2xl bg-card p-5 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Habitaciones
              </h2>
              <button
                type="button"
                onClick={() =>
                  router.push(
                    `/search?start=${sp.startDate}&end=${sp.endDate}&adults=${sp.adults}&kids=${sp.kids}&babies=${sp.babies}&pets=${sp.pets}`,
                  )
                }
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <Pencil className="h-3 w-3" /> Cambiar
              </button>
            </div>

            <div className="space-y-4">
              {selectedRooms.map((room: any) => {
                const img = room.images?.[0]?.url || room.images?.[0] || "/placeholder.svg"
                const name = room.nameRoom ?? room.name ?? "Habitación"
                const type = room.type ?? ""
                return (
                  <div key={room.id} className="flex gap-4">
                    <img src={img} alt={name} className="h-20 w-28 flex-shrink-0 rounded-xl object-cover" />
                    <div className="min-w-0">
                      <h3 className="font-bold text-card-foreground truncate">Hab. {name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{type}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Capacidad: <span className="font-medium text-foreground">{room.capacity ?? "-"}</span>
                      </p>
                      <p className="mt-1 text-sm font-bold">
                        ${room.price} <span className="text-muted-foreground font-normal">/ noche</span>
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>

            <p className="mt-4 text-sm font-bold">
              Total habitaciones: ${roomsPerNight} x {nights} noche{nights > 1 ? "s" : ""} ={" "}
              <span className="text-accent">${roomsTotal}</span>
            </p>
          </div>

          {/* Services */}
          {(selectedServices?.length ?? 0) > 0 && (
            <div className="rounded-2xl bg-card p-5 shadow">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Servicios Adicionales
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/booking/services")}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <Pencil className="h-3 w-3" /> Editar
                </button>
              </div>

              {loadingServices ? (
                <p className="text-sm text-muted-foreground">Cargando servicios...</p>
              ) : (
                <div className="space-y-2">
                  {svcDetails.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">
                        {s.name} x{s.amount}
                      </span>
                      <span className="font-bold">${s.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Guest */}
          <div className="rounded-2xl bg-card p-5 shadow">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Datos del Huésped
              </h2>
              <button
                type="button"
                onClick={() => router.push("/booking/guest")}
                className="flex items-center gap-1 text-xs text-accent hover:underline"
              >
                <Pencil className="h-3 w-3" /> Editar
              </button>
            </div>

            <div className="grid gap-2 text-sm sm:grid-cols-2">
              <div>
                <span className="text-muted-foreground">Nombre:</span>{" "}
                <span className="font-medium">{guestInfo.name}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Email:</span>{" "}
                <span className="font-medium">{guestInfo.email}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Teléfono:</span>{" "}
                <span className="font-medium">{guestInfo.phone}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Documento:</span>{" "}
                <span className="font-medium">
                  {guestInfo.documentType} {guestInfo.documentNumber}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Price summary */}
        <div>
          <div className="sticky top-28 rounded-2xl bg-card p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
              <Hotel className="h-5 w-5 text-accent" />
              Resumen
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  Habitaciones ({nights} noche{nights > 1 ? "s" : ""})
                </span>
                <span className="font-bold">${roomsTotal}</span>
              </div>

              {svcTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicios</span>
                  <span className="font-bold">${svcTotal}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-accent">${grandTotal}</span>
              </div>
            </div>

            {payError && (
              <p className="mt-4 text-sm text-red-500">{payError}</p>
            )}

            <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/40 p-4">
            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept-terms"
                checked={acceptedTerms}
                onCheckedChange={(checked) => setBookingConsents ({ acceptedTerms: checked === true })}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="accept-terms"
                  className="text-sm font-medium leading-relaxed text-foreground cursor-pointer"
                >
                  Acepto los términos y condiciones de la reserva, políticas de cancelación,
                  devoluciones y condiciones generales de alojamiento.
                </Label>
                <Link
                  href="/booking/terms"
                  className="inline-block text-sm font-medium text-accent hover:underline"
                >
                  Ver términos y condiciones
                </Link>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <Checkbox
                id="accept-minors"
                checked={acceptedMinorsPolicy}
                onCheckedChange={(checked) => setBookingConsents ({ acceptedMinorsPolicy: checked === true })}
                className="mt-1"
              />
              <div className="space-y-1">
                <Label
                  htmlFor="accept-minors"
                  className="text-sm font-medium leading-relaxed text-foreground cursor-pointer"
                >
                  Confirmo que, en caso de ingresar menores de edad, deberán presentar tarjeta
                  de identidad o registro civil y deberán estar acompañados por su padre o madre.
                  No se permite el ingreso únicamente con tíos, hermanos u otros acompañantes.
                </Label>
              </div>
            </div>

            {(!acceptedTerms || !acceptedMinorsPolicy) && (
              <p className="text-xs text-muted-foreground">
                Debes aceptar ambas condiciones para continuar al pago.
              </p>
            )}
          </div>

            <Button
              onClick={handleGoToMercadoPago}
              disabled={!canProceedToPay}
              className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl py-3 h-auto text-base font-bold disabled:opacity-50"
            >
              {paying ? "Redirigiendo a Mercado Pago..." : "Ir a Pagar"}
              {!paying && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}