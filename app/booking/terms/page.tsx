//app/booking/terms/page.tsx

"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function BookingTermsPage() {
  const router = useRouter()

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">
          Términos y Condiciones
        </h1>
        <p className="mt-2 text-muted-foreground">
          Lea cuidadosamente las condiciones aplicables a su reserva, pagos,
          cancelaciones, devoluciones y políticas de ingreso.
        </p>
      </div>

      <div className="space-y-6 rounded-2xl bg-card p-6 shadow">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. Reserva y pago</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Toda reserva estará sujeta a disponibilidad y quedará formalmente registrada
            una vez el huésped complete el proceso de pago o confirmación correspondiente.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">2. Cancelaciones y devoluciones</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Las cancelaciones y devoluciones estarán sujetas a validación administrativa
            y a las políticas vigentes del hotel al momento de la reserva. En caso de que
            aplique devolución, esta podrá tomar algunos días hábiles según el medio de pago
            utilizado y las validaciones internas correspondientes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">3. Ingreso y permanencia</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El huésped deberá presentar documentación válida al momento del ingreso. El hotel
            podrá negar el ingreso cuando no se cumplan las políticas de identificación,
            acompañamiento o capacidad máxima permitida por habitación.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">4. Menores de edad</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Todo menor de edad deberá presentar tarjeta de identidad o registro civil y deberá
            ingresar acompañado de su padre o madre. No se permitirá el ingreso de menores
            acompañados únicamente por tíos, hermanos u otros terceros no autorizados.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">5. Responsabilidad del huésped</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El huésped declara que la información suministrada durante el proceso de reserva
            es veraz y completa. Cualquier inconsistencia podrá afectar la validez de la reserva.
          </p>
        </section>
      </div>

      <div className="mt-8">
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="rounded-xl px-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
      </div>
    </div>
  )
}