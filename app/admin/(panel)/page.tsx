//app/admin/(panel)/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { useBooking } from "@/lib/booking-context"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BedDouble, CalendarCheck, DollarSign, Users, Clock } from "lucide-react"

import { listServicesService, type BackendService } from "@/services/service.service"
import {
  listReservationsService,
  type ReservationListItem,
} from "@/services/reservation.service"
import { formatCurrencyCOP } from "@/utils/format"
import { formatDateSpanish } from "@/utils/date"

export default function AdminDashboard() {
  const { rooms, adminAuth } = useBooking()

  const [services, setServices] = useState<BackendService[]>([])
  const [servicesError, setServicesError] = useState<string | null>(null)

  const [reservations, setReservations] = useState<ReservationListItem[]>([])
  const [reservationsError, setReservationsError] = useState<string | null>(null)
  const [loadingReservations, setLoadingReservations] = useState(false)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        const data = await listServicesService()
        if (!alive) return
        setServices((data as any[]) ?? [])
      } catch (e: any) {
        if (!alive) return
        setServicesError(e?.message ?? "Error cargando servicios")
        setServices([])
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        setLoadingReservations(true)
        setReservationsError(null)

        const res = await listReservationsService()

        if (!res?.ok || !Array.isArray(res?.data?.data)) {
          throw new Error("No se pudieron cargar las reservas")
        }

        setReservations(res.data.data)
        
      } catch (e: any) {
        if (!alive) return
        setReservationsError(e?.message ?? "Error cargando reservas")
        setReservations([])
      } finally {
        if (!alive) return
        setLoadingReservations(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const totalRevenue = reservations
    .filter((r) => r.status === "APPROVED" || r.status === "CONFIRMED")
    .reduce((sum, r) => sum + Number(r.totalValue || 0), 0)

  const pendingCount = reservations.filter((r) => r.status === "PAID_PENDING_APPROVAL").length
  const approvedCount = reservations.filter(
    (r) => r.status === "APPROVED" || r.status === "CONFIRMED"
  ).length

  const availableRooms = rooms.filter((r: any) => r.status === "ACTIVE").length
  const activeServices = services.filter((s) => s.status === "ACTIVE").length

  const stats = [
    {
      label: "Ingresos Totales",
      value: formatCurrencyCOP(totalRevenue),
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      label: "Reservas Pendientes",
      value: pendingCount,
      icon: Clock,
      color: "text-amber-600",
    },
    {
      label: "Reservas Aprobadas",
      value: approvedCount,
      icon: CalendarCheck,
      color: "text-blue-600",
    },
    {
      label: "Habitaciones Disponibles",
      value: `${availableRooms}/${rooms.length}`,
      icon: BedDouble,
      color: "text-purple-600",
    },
    {
      label: "Servicios Activos",
      value: activeServices,
      icon: Users,
      color: "text-teal-600",
    },
  ]

  const recentReservations = useMemo(() => {
    return [...reservations]
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || a.startDate).getTime()
        const dateB = new Date(b.createdAt || b.startDate).getTime()
        return dateB - dateA
      })
      .slice(0, 5)
  }, [reservations])

  const statusLabels: Record<string, string> = {
  PENDING: "Pendiente",
  PAID_PENDING_APPROVAL: "Pago pendiente aprobación",
  APPROVED: "Aprobada",
  CONFIRMED: "Confirmada",
  REJECTED: "Rechazada",
}

const statusClassName = (s: string) => {
  if (s === "PENDING") {
    return "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-100"
  }

  if (s === "PAID_PENDING_APPROVAL") {
    return "bg-yellow-100 text-yellow-800 border border-yellow-300 hover:bg-yellow-100"
  }

  if (s === "APPROVED") {
    return "bg-orange-100 text-orange-800 border border-orange-300 hover:bg-orange-100"
  }

  if (s === "CONFIRMED") {
    return "bg-green-100 text-green-800 border border-green-300 hover:bg-green-100"
  }

  if (s === "REJECTED") {
    return "bg-red-100 text-red-800 border border-red-300 hover:bg-red-100"
  }

  return "bg-muted text-muted-foreground border border-border"
}

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Panel de Administración</h1>
        <p className="text-muted-foreground">
          Bienvenido, {adminAuth.user?.role}.{" "}
          {adminAuth.user?.role === "EMPLOYEE"
            ? "Vista de empleado (solo lectura)."
            :""}
        </p>
        {servicesError && <p className="mt-2 text-sm text-red-500">{servicesError}</p>}
        {reservationsError && <p className="mt-2 text-sm text-red-500">{reservationsError}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="font-serif text-foreground">Reservas Recientes</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingReservations ? (
            <p className="py-8 text-center text-muted-foreground">Cargando reservas...</p>
          ) : recentReservations.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">No hay reservas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Código</th>
                    <th className="pb-3 pr-4 font-medium">Huésped</th>
                    <th className="pb-3 pr-4 font-medium">Fechas</th>
                    <th className="pb-3 pr-4 font-medium">Total</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((res) => {
                    const roomNames =
                      res.rooms?.map((room) => room.nameRoom).join(", ") || "Sin habitación"

                    return (
                      <tr key={res.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs text-foreground">
                          {res.reservationCode || res.id}
                        </td>
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium text-foreground">
                              {res.client?.fullName || res.client?.documentNumber || "Sin nombre"}
                            </p>
                            <p className="text-xs text-muted-foreground">{roomNames}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {formatDateSpanish(res.startDate)} - {formatDateSpanish(res.endDate)}
                        </td>
                        <td className="py-3 pr-4 font-medium text-foreground">
                          {formatCurrencyCOP(res.totalValue)}
                        </td>
                        <td className="py-3">
                          <Badge className={statusClassName(res.status)}>
                            {statusLabels[res.status] || res.status}
                          </Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}