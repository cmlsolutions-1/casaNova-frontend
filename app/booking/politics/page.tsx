//app/booking/politics/page.tsx

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
          Reglamento Interno y Políticas
        </h1>
        <p className="mt-2 text-muted-foreground">
          Hotel Campestre Casanova
        </p>
      </div>

      <div className="space-y-6 rounded-2xl bg-card p-6 shadow">
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">1. OBJETIVO</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El presente reglamento tiene como finalidad establecer las normas de
            convivencia, uso de instalaciones, políticas de reserva y condiciones
            generales de hospedaje del Hotel Campestre Casanova, con el propósito
            de garantizar una estadía segura, tranquila, cómoda y agradable para
            todos los huéspedes y visitantes.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            2. HORARIOS GENERALES DEL HOTEL
          </h2>

          <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
            <div className="grid gap-3 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
              {[
                ["Check-in", "3:00 PM"],
                ["Check-out", "1:00 PM"],
                ["Desayuno", "7:00 AM a 9:00 AM"],
                ["Piscina", "7:00 AM a 10:00 PM"],
                ["Cancha de fútbol", "8:00 AM a 10:00 PM"],
                ["Cancha de tejo", "10:00 AM a 7:00 PM"],
                ["Bar", "4:00 PM a 12:00 AM"],
                ["Billar", "9:00 AM a 12:00 AM"],
                ["Sendero ecológico", "8:00 AM a 4:00 PM"],
                ["Salón de eventos", "6:00 PM a 3:00 AM"],
                ["Pasadía", "8:00 AM a 4:00 PM"],
                ["Jacuzzi", "6:00 PM a 10:00 PM"],
                ["Baño turco", "6:00 PM a 10:00 PM"],
              ].map(([label, value]) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <p>
                    <span className="font-semibold text-foreground">
                      {label}:
                    </span>{" "}
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            3. POLÍTICAS DE RESERVA Y PAGO
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Toda reserva estará sujeta a disponibilidad y quedará confirmada
            únicamente cuando el huésped haya realizado el pago parcial o total
            correspondiente. Las tarifas pueden variar según temporada, número
            de huéspedes, promociones o eventos especiales.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            4. POLÍTICA DE CANCELACIONES Y REPROGRAMACIONES
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Una vez realizado el pago total o parcial de la reserva, no habrá
            devolución de dinero bajo ninguna circunstancia. No obstante, el
            hotel podrá autorizar una reprogramación sujeta a disponibilidad y
            aprobación administrativa.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            5. REGISTRO E INGRESO DE HUÉSPEDES
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Todos los huéspedes deberán presentar un documento de identidad
            válido al momento del check-in. El hotel se reserva el derecho de
            admisión cuando existan comportamientos irrespetuosos, agresivos o
            que afecten la tranquilidad de otros huéspedes.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            6. POLÍTICA PARA MENORES DE EDAD
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Todo menor de edad deberá ingresar acompañado de su padre o madre y
            presentar tarjeta de identidad o registro civil. No se permitirá el
            ingreso de menores únicamente con tíos, hermanos u otros terceros no
            autorizados.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            7. NORMAS DE CONVIVENCIA
          </h2>

          <p className="text-sm leading-relaxed text-muted-foreground">
            Está prohibido:
          </p>

          <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {[
                "Música con alto volumen.",
                "Fumar en habitaciones o áreas cerradas.",
                "Consumir sustancias alucinógenas.",
                "Ingresar armas o explosivos.",
                "Realizar actos violentos o discriminatorios.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm leading-relaxed text-muted-foreground">
            El incumplimiento podrá generar expulsión inmediata sin derecho a
            reembolso.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-foreground">
            8. POLÍTICA PET FRIENDLY
          </h2>

          <div className="rounded-2xl border border-border/50 bg-muted/30 p-5">
            <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
              {[
                "Hotel Campestre Casanova es Pet Friendly.",
                "Valor adicional por mascota: $30.000 por noche.",
                "Las mascotas deben permanecer bajo supervisión.",
                "Deben portar collar en zonas comunes.",
                "Razas potencialmente peligrosas deberán usar bozal.",
                "Los daños ocasionados serán cobrados al titular de la reserva.",
              ].map((item) => (
                <div key={item} className="flex items-start gap-2">
                  <span className="mt-1 text-primary">•</span>
                  <p>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            9. USO DE INSTALACIONES
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El uso de piscina, jacuzzi, baño turco y demás áreas comunes debe
            realizarse respetando horarios y normas de seguridad. Los menores de
            edad deben permanecer bajo supervisión de un adulto responsable.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            10. ALIMENTOS Y BEBIDAS
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            No está permitido ingresar bebidas o alimentos externos sin
            autorización previa del hotel, salvo alimentos para bebés o
            situaciones especiales autorizadas.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            11. DAÑOS Y RESPONSABILIDADES
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El huésped será responsable por cualquier daño ocasionado a
            habitaciones, mobiliario, equipos o zonas comunes del hotel.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            12. OBJETOS PERSONALES
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El hotel no se hace responsable por pérdida de dinero, joyas, equipos
            electrónicos, vehículos u objetos olvidados dentro de las
            instalaciones.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            13. POLÍTICA AMBIENTAL
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Solicitamos hacer uso responsable del agua, energía y zonas
            naturales, contribuyendo a la conservación del entorno ambiental del
            Quindío.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-bold text-foreground">
            14. ACEPTACIÓN DE POLÍTICAS
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground">
            El ingreso y permanencia en el Hotel Campestre Casanova implica la
            aceptación total de las políticas, reglamentos y condiciones aquí
            establecidas.
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