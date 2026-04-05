//app/booking/confirm/page.tsx
"use client"

import Link from "next/link"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  CalendarDays,
  Users,
  ArrowRight,
  Pencil,
  Hotel,
  Minus,
  Plus,
  X,
} from "lucide-react"
import { parseISO, format } from "date-fns"
import { es } from "date-fns/locale"

import { listServicesPublicService, type BackendService } from "@/services/service.service"
import {
  createReservationPublicService,
} from "@/services/reservation.service"
import { upsertClientPublicService } from "@/services/client.service"
import { createPaymentPublicService } from "@/services/payment.service"
import {
  listAvailableRoomsPublicService,
  type BackendRoom,
} from "@/services/room.service"

import { EXTRA_BOOKING_OPTIONS } from "@/lib/day-services"
import { formatCurrencyCOP } from "@/utils/format"
import { calculateRoomPrice } from "@/utils/price-calculator"

const PAYMENT_LOCK_KEY = "booking_payment_in_progress"

export default function BookingConfirmPage() {
  const router = useRouter()
  const {
    booking,
    hydrated,
    setBookingConsents,
    clearBookingSession,
    replaceSelectedRooms,
    setSearchParams,
  } = useBooking()

  const { searchParams: sp, selectedRooms, selectedServices, guestInfo, extraBooking } = booking

  const acceptedTerms = booking.consents?.acceptedTerms ?? false
  const acceptedMinorsPolicy = booking.consents?.acceptedMinorsPolicy ?? false

  const [servicesFromApi, setServicesFromApi] = useState<BackendService[]>([])
  const [loadingServices, setLoadingServices] = useState(true)

  const [paying, setPaying] = useState(false)
  const [payError, setPayError] = useState<string | null>(null)

  const [timeLeft, setTimeLeft] = useState(0)

  const [editingSearch, setEditingSearch] = useState(false)
  const [localSearch, setLocalSearch] = useState(sp)

  const [editingRooms, setEditingRooms] = useState(false)
  const [availableRooms, setAvailableRooms] = useState<BackendRoom[]>([])
  const [loadingRooms, setLoadingRooms] = useState(false)
  const [roomPickerError, setRoomPickerError] = useState<string | null>(null)

  const [tempSelectedRooms, setTempSelectedRooms] = useState<any[]>([])
  

  const paymentLockRef = useRef(false)

  const isExtraBooking = !!extraBooking
  const extraConfig = extraBooking ? EXTRA_BOOKING_OPTIONS[extraBooking.kind] : null

  useEffect(() => {
    setLocalSearch(sp)
  }, [sp])

  useEffect(() => {
    if (editingRooms) {
      setTempSelectedRooms(selectedRooms ?? [])
    }
  }, [editingRooms, selectedRooms])

  useEffect(() => {
    paymentLockRef.current = false
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(PAYMENT_LOCK_KEY)
    }
  }, [])

  useEffect(() => {
    if (!hydrated) return
    if (!booking.expiresAt) return

    const update = () => {
      const diff = Math.max(
        0,
        Math.floor((new Date(booking.expiresAt!).getTime() - Date.now()) / 1000),
      )

      setTimeLeft(diff)

      if (diff <= 0) {
        clearBookingSession()
        router.push("/")
      }
    }

    update()
    const interval = setInterval(update, 1000)
    return () => clearInterval(interval)
  }, [hydrated, booking.expiresAt, clearBookingSession, router])

  useEffect(() => {
    if (!hydrated) return

    const hasRooms = !!selectedRooms && selectedRooms.length > 0
    const hasExtraBooking = !!extraBooking

    if ((!sp && !hasExtraBooking) || !guestInfo) {
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
  }, [hydrated, sp, guestInfo, selectedRooms, extraBooking, router])

  useEffect(() => {
    if (!editingRooms || !sp) return

    let alive = true
    ;(async () => {
      try {
        setLoadingRooms(true)
        setRoomPickerError(null)

        const data = await listAvailableRoomsPublicService({
        start: sp.startDate,
        end: sp.endDate,
        people: 1,
      })

        if (!alive) return

        const filtered = (data ?? []).filter((r) => r.status === "ACTIVE")
        setAvailableRooms(filtered)
      } catch (e: any) {
        if (!alive) return
        setRoomPickerError(e?.message ?? "No se pudieron cargar habitaciones disponibles")
        setAvailableRooms([])
      } finally {
        if (alive) setLoadingRooms(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [editingRooms, sp])

  const nights = useMemo(() => {
    if (!sp) return 0
    const start = parseISO(sp.startDate)
    const end = parseISO(sp.endDate)
    return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)))
  }, [sp])

  const hasRooms = !!selectedRooms && selectedRooms.length > 0
  const hasExtraBooking = !!extraBooking

  const formattedTimeLeft = useMemo(() => {
    const minutes = Math.floor(timeLeft / 60)
    const seconds = timeLeft % 60
    return `${minutes}:${String(seconds).padStart(2, "0")}`
  }, [timeLeft])

  if (!hydrated) return null

  if ((!sp && !hasExtraBooking) || !guestInfo) {
    return null
  }

  const prettyRange = (() => {
    try {
      if (isExtraBooking && extraBooking?.date) {
        return format(parseISO(extraBooking.date), "dd MMM yyyy", { locale: es })
      }

      if (sp) {
        return `${format(parseISO(sp.startDate), "dd MMM yyyy", { locale: es })} - ${format(parseISO(sp.endDate), "dd MMM yyyy", { locale: es })}`
      }

      return ""
    } catch {
      if (isExtraBooking && extraBooking?.date) return extraBooking.date
      if (sp) return `${sp.startDate} - ${sp.endDate}`
      return ""
    }
  })()

  const roomsPerNight = isExtraBooking
    ? 0
    : selectedRooms.reduce((sum: number, r: any) => {
      // Usar el priceBreakdown si existe, sino calcular
      if (r.priceBreakdown) {
        return sum + r.priceBreakdown.total
      }
      const selectedPeople = Number(r.selectedPeople ?? 1)
      const selectedAdults = Number(r.selectedAdults ?? selectedPeople)
      const selectedKids = Number(r.selectedKids ?? 0)
      
      const priceCalc = calculateRoomPrice(
        Number(r.price ?? 0),
        selectedAdults,
        selectedKids
      )
      
      return sum + priceCalc.total
    }, 0)



  const roomsTotal = isExtraBooking ? 0 : roomsPerNight * nights

  const svcDetails = isExtraBooking
    ? []
    : (selectedServices ?? []).map((s) => {
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

  const grandTotal = isExtraBooking
    ? Number(extraBooking?.totalPrice ?? 0)
    : roomsTotal + svcTotal

  const totalPeople = sp ? sp.adults + sp.kids + sp.babies : 0
  const capacityTotal = selectedRooms.reduce(
    (sum: number, r: any) => sum + (r.capacity ?? 0),
    0,
  )

  const canProceedToPay = acceptedTerms && acceptedMinorsPolicy && !paying

  const totalGuestsNeeded =
  Number(sp?.adults ?? 0) + Number(sp?.kids ?? 0) + Number(sp?.babies ?? 0)

  const currentTempCapacity = tempSelectedRooms.reduce(
    (sum, room) => sum + Number(room.capacity ?? 0),
    0,
  )

  const handleToggleRoom = (room: BackendRoom) => {
    const exists = tempSelectedRooms.some((r) => r.id === room.id)

    if (exists) {
      setTempSelectedRooms((prev) => prev.filter((r) => r.id !== room.id))
      return
    }

    setTempSelectedRooms((prev) => [
      ...prev,
      {
        ...room,
        selectedPeople: Number(room.capacity ?? 0),
        selectedPricePerNight: Number(room.price ?? 0) * Number(room.capacity ?? 0),
      },
    ])
  }

    const handleConfirmRooms = () => {
    if (!sp) return

    const neededGuests =
      Number(sp.adults ?? 0) + Number(sp.kids ?? 0) + Number(sp.babies ?? 0)

    const capacity = tempSelectedRooms.reduce(
      (sum, room) => sum + Number(room.capacity ?? 0),
      0,
    )

    if (capacity < neededGuests) {
      setRoomPickerError(
        "La capacidad total de las habitaciones seleccionadas no alcanza para todos los huéspedes.",
      )
      return
    }

    let remainingAdults = Number(sp.adults ?? 0)
    let remainingKids = Number(sp.kids ?? 0)
    let remainingBabies = Number(sp.babies ?? 0)

    const normalizedRooms = tempSelectedRooms.map((room) => {
      const capacity = Number(room.capacity ?? 0)
      let used = 0

      const adultsHere = Math.min(remainingAdults, capacity - used)
      used += adultsHere
      remainingAdults -= adultsHere

      const kidsHere = Math.min(remainingKids, capacity - used)
      used += kidsHere
      remainingKids -= kidsHere

      const babiesHere = Math.min(remainingBabies, capacity - used)
      used += babiesHere
      remainingBabies -= babiesHere

      return {
        ...room,
        selectedPeople: used,
        selectedPricePerNight: Number(room.price ?? 0) * used,
      }
    })

    replaceSelectedRooms(normalizedRooms)
    setEditingRooms(false)
    setRoomPickerError(null)
  }

  const handleGoToMercadoPago = async () => {
    if (!guestInfo) return

    if (paymentLockRef.current) return
    if (typeof window !== "undefined" && sessionStorage.getItem(PAYMENT_LOCK_KEY) === "1") return

    paymentLockRef.current = true
    if (typeof window !== "undefined") {
      sessionStorage.setItem(PAYMENT_LOCK_KEY, "1")
    }

    setPaying(true)
    setPayError(null)

    try {
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

      if (isExtraBooking && extraBooking) {
        const selectedDate = new Date(extraBooking.date)

        const startAt = new Date(selectedDate)
        const endAt = new Date(selectedDate)

        if (extraBooking.kind === "EVENT_HALL") {
          startAt.setHours(19, 0, 0, 0)
          endAt.setDate(endAt.getDate() + 1)
          endAt.setHours(2, 30, 0, 0)
        } else {
          startAt.setHours(8, 0, 0, 0)
          endAt.setHours(18, 0, 0, 0)
        }

        const reservationBody = {
          startDate: startAt.toISOString(),
          endDate: endAt.toISOString(),
          clientDocument: guestInfo.documentNumber,
          type: "DAY_PASS" as const,
          services: [
            {
              serviceId: extraBooking.serviceId,
              amount: extraBooking.people,
              startAt: startAt.toISOString(),
              endAt: endAt.toISOString(),
            },
          ],
        }

        const reservationRes = await createReservationPublicService(reservationBody)

        if (!reservationRes?.ok) {
          throw new Error(reservationRes?.message || "No se pudo crear la reserva del servicio")
        }

        const reservationId = reservationRes.data?.id
        if (!reservationId) {
          throw new Error("El backend no devolvió id de reserva")
        }

        // GUARDAR ID EN SESSION STORAGE
        if (typeof window !== "undefined") {
          sessionStorage.setItem("mp_reservation_id", reservationId)
        }

        const paymentRes = await createPaymentPublicService({ reservationId })

        if (!paymentRes?.ok) {
          // LIMPIAR STORAGE EN CASO DE ERROR
          sessionStorage.removeItem("mp_reservation_id")
          throw new Error(paymentRes?.message || "No se pudo generar el link de pago")
        }

        const checkoutUrl = paymentRes.data?.initPoint || paymentRes.data?.sandboxInitPoint

        if (!checkoutUrl) {
          // Limpiar en caso de error
          sessionStorage.removeItem("mp_reservation_id")
          throw new Error("No se recibió el link de pago de Mercado Pago")
        }

        window.location.href = checkoutUrl
        return
      }

      if (!sp || !selectedRooms || selectedRooms.length === 0) {
        throw new Error("No hay habitaciones seleccionadas")
      }

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

        if (used > 0) {
          if (roomEntry.numberOfPeople === undefined) {
            roomEntry.numberOfPeople = 0
          }
          roomsPayload.push(roomEntry)
        }
      }

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
        type: "STAY" as const,
        rooms: roomsPayload,
        ...(servicesPayload ? { services: servicesPayload } : {}),
      }

      const reservationRes = await createReservationPublicService(reservationBody)

      if (!reservationRes?.ok) {
        throw new Error(reservationRes?.message || "No se pudo crear la reserva")
      }

      const reservationId = reservationRes.data?.id
      if (!reservationId) {
        throw new Error("El backend no devolvió id de reserva")
      }

      // GUARDAR ID EN SESSION STORAGE
      if (typeof window !== "undefined") {
        sessionStorage.setItem("mp_reservation_id", reservationId)
      }

      const paymentRes = await createPaymentPublicService({ reservationId })

      if (!paymentRes?.ok) {
        sessionStorage.removeItem("mp_reservation_id")
        throw new Error(paymentRes?.message || "No se pudo generar el link de pago")
      }

      const checkoutUrl = paymentRes.data?.initPoint || paymentRes.data?.sandboxInitPoint

      if (!checkoutUrl) {
        throw new Error("No se recibió el link de pago de Mercado Pago")
      }

      window.location.href = checkoutUrl
    } catch (e: any) {
      console.error("Error en proceso de pago:", e)
      setPayError(e?.message ?? "Ocurrió un error redirigiendo al pago")
      setPaying(false)
      paymentLockRef.current = false

      if (typeof window !== "undefined") {
        sessionStorage.removeItem(PAYMENT_LOCK_KEY)
        sessionStorage.removeItem("mp_reservation_id")
      }
    }
  }

  const guestFields: Array<{
    key: "adults" | "kids" | "babies" | "pets"
    label: string
    min: number
  }> = [
    { key: "adults", label: "Adultos", min: 1 },
    { key: "kids", label: "Niños", min: 0 },
    { key: "babies", label: "Bebés", min: 0 },
    { key: "pets", label: "Mascotas", min: 0 },
  ]

  return (
    <div>
      {timeLeft > 0 && (
        <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 p-4">
          <p className="font-semibold text-amber-800">
            Esta reserva vence en {formattedTimeLeft}
          </p>
          <p className="mt-1 text-sm text-amber-700">
            Si el tiempo se agota, tu selección se limpiará automáticamente.
          </p>
        </div>
      )}

      <h1 className="mb-2 font-serif text-2xl font-bold text-foreground md:text-3xl">
        Confirmar reserva
      </h1>
      <p className="mb-8 text-muted-foreground">
        Revise los detalles antes de proceder al pago.
      </p>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-card p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Fechas y Huéspedes
              </h2>

              {!isExtraBooking && (
                <button
                  type="button"
                  onClick={() => setEditingSearch((v) => !v)}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <Pencil className="h-3 w-3" />
                  {editingSearch ? "Cancelar" : "Editar"}
                </button>
              )}
            </div>

            {!editingSearch || isExtraBooking ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {isExtraBooking ? "Fecha del servicio" : "Estancia"}
                    </p>
                    <p className="text-sm font-bold">{prettyRange}</p>
                    {!isExtraBooking && (
                      <p className="text-xs text-muted-foreground">
                        {nights} noche{nights > 1 ? "s" : ""}
                      </p>
                    )}
                    {isExtraBooking && extraConfig?.schedule && (
                      <p className="text-xs text-muted-foreground">{extraConfig.schedule}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-accent" />
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {isExtraBooking ? "Asistentes" : "Huéspedes"}
                    </p>

                    {isExtraBooking ? (
                      <p className="text-sm font-bold">
                        {extraBooking?.people} persona{Number(extraBooking?.people) === 1 ? "" : "s"}
                      </p>
                    ) : (
                      <>
                        <p className="text-sm font-bold">
                          {sp?.adults} adulto{sp?.adults && sp.adults > 1 ? "s" : ""}
                          {sp?.kids ? `, ${sp.kids} niño${sp.kids > 1 ? "s" : ""}` : ""}
                          {sp?.babies ? `, ${sp.babies} bebé${sp.babies > 1 ? "s" : ""}` : ""}
                          {sp?.pets ? `, ${sp.pets} mascota${sp.pets > 1 ? "s" : ""}` : ""}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Capacidad seleccionada: {capacityTotal} (para {totalPeople})
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">Entrada</Label>
                  <input
                    type="date"
                    value={localSearch?.startDate || ""}
                    onChange={(e) =>
                      setLocalSearch((prev: any) => ({
                        ...prev,
                        startDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <Label className="mb-1 block text-xs text-muted-foreground">Salida</Label>
                  <input
                    type="date"
                    value={localSearch?.endDate || ""}
                    onChange={(e) =>
                      setLocalSearch((prev: any) => ({
                        ...prev,
                        endDate: e.target.value,
                      }))
                    }
                    className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm"
                  />
                </div>

                  {guestFields.map((item) => (
                    <div key={item.key}>
                      <Label className="mb-1 block text-xs text-muted-foreground">{item.label}</Label>

                      <div className="flex items-center rounded-xl border border-border">
                        <button
                          type="button"
                          className="px-3 py-2"
                          onClick={() =>
                            setLocalSearch((prev: any) => ({
                              ...prev,
                              [item.key]: Math.max(item.min, Number(prev?.[item.key] ?? item.min) - 1),
                            }))
                          }
                        >
                          <Minus className="h-4 w-4" />
                        </button>

                        <div className="flex-1 text-center text-sm font-medium">
                          {Number(localSearch?.[item.key] ?? item.min)}
                        </div>

                        <button
                          type="button"
                          className="px-3 py-2"
                          onClick={() =>
                            setLocalSearch((prev: any) => ({
                              ...prev,
                              [item.key]: Number(prev?.[item.key] ?? item.min) + 1,
                            }))
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  

                <Button
                  type="button"
                  className="col-span-2 mt-2 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                  onClick={() => {
                    if (!localSearch?.startDate || !localSearch?.endDate) return

                    const adults = Number(localSearch.adults ?? 1)
                    const kids = Number(localSearch.kids ?? 0)
                    const babies = Number(localSearch.babies ?? 0)
                    const pets = Number(localSearch.pets ?? 0)

                    setSearchParams({
                      startDate: localSearch.startDate,
                      endDate: localSearch.endDate,
                      adults,
                      kids,
                      babies,
                      pets,
                    })

                    router.push(
                      `/search?start=${localSearch.startDate}&end=${localSearch.endDate}&adults=${adults}&kids=${kids}&babies=${babies}&pets=${pets}&returnTo=confirm`,
                    )
                  }}
                >
                  Buscar disponibilidad
                </Button>
              </div>
            )}
          </div>

          {isExtraBooking && extraBooking && extraConfig && (
            <div className="rounded-2xl bg-card p-5 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Servicio seleccionado
                </h2>
                <button
                  type="button"
                  onClick={() => router.push(`/booking/extra-service/${extraBooking.serviceId}`)}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <Pencil className="h-3 w-3" /> Cambiar
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <p className="font-bold text-card-foreground">{extraConfig.title}</p>
                <p className="text-muted-foreground">{extraConfig.description}</p>

                <p>
                  <span className="text-muted-foreground">Fecha:</span>{" "}
                  <span className="font-medium text-foreground">{prettyRange}</span>
                </p>

                <p>
                  <span className="text-muted-foreground">Personas:</span>{" "}
                  <span className="font-medium text-foreground">{extraBooking.people}</span>
                </p>

                {extraConfig.schedule && (
                  <p>
                    <span className="text-muted-foreground">Horario:</span>{" "}
                    <span className="font-medium text-foreground">{extraConfig.schedule}</span>
                  </p>
                )}

                <p>
                  <span className="text-muted-foreground">Total:</span>{" "}
                  <span className="font-bold text-accent">
                    {formatCurrencyCOP(extraBooking.totalPrice)}
                  </span>
                </p>
              </div>
            </div>
          )}

          {!isExtraBooking && (
            <div className="rounded-2xl bg-card p-5 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Habitaciones
                </h2>
                <button
                  type="button"
                  onClick={() => setEditingRooms(true)}
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

                  const priceCalc = room.priceBreakdown ?? calculateRoomPrice(
                    Number(room.price ?? 0),
                    Number(room.selectedAdults ?? room.selectedPeople ?? 1),
                    Number(room.selectedKids ?? 0)
                  )

                  return (
                    <div key={room.id} className="flex gap-4">
                      <img
                        src={img}
                        alt={name}
                        className="h-20 w-28 flex-shrink-0 rounded-xl object-cover"
                      />
                      <div className="min-w-0">
                        <h3 className="truncate font-bold text-card-foreground">Hab. {name}</h3>
                        <p className="text-sm capitalize text-muted-foreground">{type}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Capacidad: <span className="font-medium text-foreground">{room.capacity ?? "-"}</span>
                        </p>

                  {/* Desglose de precio */}
                          <div className="mt-2 space-y-1">
                            <p className="text-sm font-bold">
                              ${priceCalc.total.toLocaleString()}
                              <span className="font-normal text-muted-foreground"> / noche</span>
                            </p>
                            
                            <div className="text-[11px] text-muted-foreground space-y-0.5">
                              {priceCalc.adultsPrice > 0 && (
                                <p>${Number(room.price).toLocaleString()} × adulto</p>
                              )}
                              {priceCalc.kidsPrice > 0 && (
                                <p className="text-emerald-600">
                                  ${(Number(room.price) * 0.5).toLocaleString()} × niño (50% dto)
                                </p>
                              )}
                            </div>
                          </div>

                        <p className="mt-1 text-sm font-bold">
                          {(
                            room.selectedPricePerNight ??
                            Number(room.price ?? 0) * Number(room.selectedPeople ?? 1)
                          ).toLocaleString()}
                          <span className="font-normal text-muted-foreground"> / noche</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Number(room.price ?? 0).toLocaleString()} x persona
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <p className="mt-4 text-sm font-bold">
                Total habitaciones: {formatCurrencyCOP(roomsPerNight)} x {nights} noche
                {nights > 1 ? "s" : ""} ={" "}
                <span className="text-accent">{formatCurrencyCOP(roomsTotal)}</span>
              </p>
            </div>
          )}

          {!isExtraBooking && (
            <div className="rounded-2xl bg-card p-5 shadow">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                  Servicios Adicionales
                </h2>
                <button
                  type="button"
                  onClick={() => router.push("/booking/services?returnTo=confirm")}
                  className="flex items-center gap-1 text-xs text-accent hover:underline"
                >
                  <Pencil className="h-3 w-3" /> {(selectedServices?.length ?? 0) > 0 ? "Editar" : "Agregar"}
                </button>
              </div>

              {loadingServices ? (
                <p className="text-sm text-muted-foreground">Cargando servicios...</p>
              ) : svcDetails.length > 0 ? (
                <div className="space-y-2">
                  {svcDetails.map((s) => (
                    <div key={s.id} className="flex items-center justify-between text-sm">
                      <span className="text-card-foreground">
                        {s.name} x{s.amount}
                      </span>
                      <span className="font-bold">{formatCurrencyCOP(s.total)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No has agregado servicios adicionales.
                </p>
              )}
            </div>
          )}

          <div className="rounded-2xl bg-card p-5 shadow">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Datos del Cliente
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

        <div>
          <div className="sticky top-28 rounded-2xl bg-card p-6 shadow-lg">
            <h2 className="mb-4 flex items-center gap-2 font-serif text-lg font-bold text-card-foreground">
              <Hotel className="h-5 w-5 text-accent" />
              Resumen
            </h2>

            <div className="space-y-3 text-sm">
              {isExtraBooking ? (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{extraConfig?.title}</span>
                  <span className="font-bold">{formatCurrencyCOP(grandTotal)}</span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Habitaciones ({nights} noche{nights > 1 ? "s" : ""})
                  </span>
                  <span className="font-bold">{formatCurrencyCOP(roomsTotal)}</span>
                </div>
              )}

              {!isExtraBooking && svcTotal > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Servicios</span>
                  <span className="font-bold">{formatCurrencyCOP(svcTotal)}</span>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-base">
                <span className="font-bold">Total</span>
                <span className="text-xl font-bold text-accent">
                  {formatCurrencyCOP(grandTotal)}
                </span>
              </div>
            </div>

            {payError && <p className="mt-4 text-sm text-red-500">{payError}</p>}

            <div className="mt-6 space-y-4 rounded-xl border border-border bg-muted/40 p-4">
              <div className="flex items-start space-x-3">
                <Checkbox
                  id="accept-terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) =>
                    setBookingConsents({ acceptedTerms: checked === true })
                  }
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="accept-terms"
                    className="cursor-pointer text-sm font-medium leading-relaxed text-foreground"
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
                  onCheckedChange={(checked) =>
                    setBookingConsents({ acceptedMinorsPolicy: checked === true })
                  }
                  className="mt-1"
                />
                <div className="space-y-1">
                  <Label
                    htmlFor="accept-minors"
                    className="cursor-pointer text-sm font-medium leading-relaxed text-foreground"
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
              type="button"
              onClick={handleGoToMercadoPago}
              disabled={!canProceedToPay}
              className="mt-6 h-auto w-full rounded-xl bg-accent py-3 text-base font-bold text-accent-foreground hover:bg-accent/90 disabled:opacity-50"
            >
              {paying ? "Redirigiendo ..." : "Ir a Pagar"}
              {!paying && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {editingRooms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[85vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">Cambiar habitación</h2>
                <p className="text-sm text-muted-foreground">
                  Selecciona una nueva habitación sin salir de confirmar reserva.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingRooms(false)}
                className="rounded-full p-2 text-muted-foreground hover:bg-secondary hover:text-foreground"
                aria-label="Cerrar"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingRooms ? (
              <p className="py-10 text-center text-muted-foreground">
                Cargando habitaciones disponibles...
              </p>
            ) : roomPickerError ? (
              <p className="py-10 text-center text-sm text-red-500">{roomPickerError}</p>
            ) : availableRooms.length === 0 ? (
              <p className="py-10 text-center text-muted-foreground">
                No hay habitaciones disponibles para las fechas seleccionadas.
              </p>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {availableRooms.map((room) => {
                    const img = room.images?.[0]?.url || "/placeholder.svg"
                    const peopleForThisRoom = Math.min(
                      Number(room.capacity ?? 0),
                      Number(sp?.adults ?? 0) + Number(sp?.kids ?? 0) + Number(sp?.babies ?? 0),
                    )
                    const roomPricePerNight = Number(room.price ?? 0) * peopleForThisRoom
                    const isSelected = tempSelectedRooms.some((r) => r.id === room.id)

                    return (
                      <div
                        key={room.id}
                        className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                      >
                        <div className="h-44 overflow-hidden">
                          <img
                            src={img}
                            alt={`Habitación ${room.nameRoom}`}
                            className="h-full w-full object-cover"
                          />
                        </div>

                        <div className="p-4">
                          <div className="mb-2 flex items-center justify-between gap-2">
                            <span className="rounded-full bg-secondary px-2 py-1 text-xs capitalize text-foreground">
                              {room.type}
                            </span>
                            <span className="text-sm font-bold text-foreground">
                              {formatCurrencyCOP(roomPricePerNight)}
                            </span>
                          </div>

                          <h3 className="text-base font-bold text-card-foreground">
                            Hab. {room.nameRoom}
                          </h3>

                          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                            {room.description}
                          </p>

                          <p className="mt-2 text-xs text-muted-foreground">
                            Capacidad: {room.capacity} personas
                          </p>

                          <Button
                            type="button"
                            onClick={() => handleToggleRoom(room)}
                            variant={isSelected ? "default" : "outline"}
                            className="mt-4 w-full rounded-xl"
                          >
                            {isSelected ? "Quitar habitación" : "Agregar habitación"}
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-6 flex items-center justify-between gap-4 border-t border-border pt-4">
                  <div className="text-sm text-muted-foreground">
                    Capacidad seleccionada:{" "}
                    <span className="font-bold text-foreground">
                      {tempSelectedRooms.reduce(
                        (sum, room) => sum + Number(room.capacity ?? 0),
                        0,
                      )}
                    </span>{" "}
                    / {Number(sp?.adults ?? 0) + Number(sp?.kids ?? 0) + Number(sp?.babies ?? 0)} huéspedes
                  </div>

                  <Button
                    type="button"
                    onClick={handleConfirmRooms}
                    className="rounded-xl bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    Confirmar habitaciones
                  </Button>
                </div>
              </>
            )
            
            
            }
          </div>
        </div>
      )}
    </div>
  )
}