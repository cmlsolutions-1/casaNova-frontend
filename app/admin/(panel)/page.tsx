"use client"

import { useBooking } from "@/lib/booking-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BedDouble, CalendarCheck, DollarSign, Users, Clock } from "lucide-react"

export default function AdminDashboard() {
  const { rooms, reservations, payments, services, adminAuth } = useBooking()

  const totalRevenue = payments.filter((p) => p.status === "paid").reduce((s, p) => s + p.amount, 0)
  const pendingCount = reservations.filter((r) => r.status === "PAID_PENDING_APPROVAL").length
  const approvedCount = reservations.filter((r) => r.status === "APPROVED").length
  const availableRooms = rooms.filter((r) => r.status === "available").length
  const activeServices = services.filter((s) => s.status === "active").length

  const stats = [
    { label: "Ingresos Totales", value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: "text-green-600" },
    { label: "Reservas Pendientes", value: pendingCount, icon: Clock, color: "text-amber-600" },
    { label: "Reservas Aprobadas", value: approvedCount, icon: CalendarCheck, color: "text-blue-600" },
    { label: "Habitaciones Disponibles", value: `${availableRooms}/${rooms.length}`, icon: BedDouble, color: "text-purple-600" },
    { label: "Servicios Activos", value: activeServices, icon: Users, color: "text-teal-600" },
  ]

  const recentReservations = [...reservations].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5)

  const statusLabels: Record<string, string> = {
    PENDING: "Pendiente",
    PAID_PENDING_APPROVAL: "Pago pendiente aprobacion",
    APPROVED: "Aprobada",
    REJECTED: "Rechazada",
  }

  const statusVariant = (s: string) => {
    if (s === "APPROVED") return "default" as const
    if (s === "REJECTED") return "destructive" as const
    return "secondary" as const
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Bienvenido, {adminAuth.user?.name}.{" "}
          {adminAuth.user?.role === "EMPLOYEE" ? "Vista de empleado (solo lectura)." : "Panel de administracion."}
        </p>
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
          {recentReservations.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No hay reservas registradas.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">ID</th>
                    <th className="pb-3 pr-4 font-medium">Huesped</th>
                    <th className="pb-3 pr-4 font-medium">Fechas</th>
                    <th className="pb-3 pr-4 font-medium">Total</th>
                    <th className="pb-3 font-medium">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((res) => {
                    const room = rooms.find((r) => r.id === res.roomId)
                    return (
                      <tr key={res.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 pr-4 font-mono text-xs text-foreground">{res.id}</td>
                        <td className="py-3 pr-4">
                          <div>
                            <p className="font-medium text-foreground">{res.guestInfo.name}</p>
                            <p className="text-xs text-muted-foreground">{room?.name || res.roomId}</p>
                          </div>
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {res.startDate} - {res.endDate}
                        </td>
                        <td className="py-3 pr-4 font-medium text-foreground">${res.totalPrice.toLocaleString()}</td>
                        <td className="py-3">
                          <Badge variant={statusVariant(res.status)}>
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
