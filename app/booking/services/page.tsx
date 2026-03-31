// app/booking/services/page.tsx
import { Suspense } from "react"
import BookingServicesClient from "./BookingServicesClient"

export default function BookingServicesPage() {
  return (
    <Suspense fallback={<div className="text-muted-foreground">Cargando servicios...</div>}>
      <BookingServicesClient />
    </Suspense>
  )
}