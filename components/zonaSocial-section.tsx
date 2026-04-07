//components/zonaSocial-section.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Waves, Trees, GlassWater, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ZonaSocialItem = {
  id: number
  title: string
  subtitle: string
  image: string
}

const zonasSociales: ZonaSocialItem[] = [
  {
    id: 1,
    title: "Piscina & descanso",
    subtitle: "Espacios pensados para relajarte y disfrutar del clima",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/PISCINA.jpg",
  },
  {
    id: 2,
    title: "Ambientes para compartir",
    subtitle: "Zonas ideales para conversar, descansar y vivir momentos especiales",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/ZONAESTAR.jpg",
  },
  {
    id: 3,
    title: "Naturaleza y tranquilidad",
    subtitle: "Un entorno acogedor para desconectarte y respirar con calma",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/ZONASOCIAL.jpg",
  },
  {
    id: 4,
    title: "Experiencias memorables",
    subtitle: "Diversión auténtica con el sabor de la tradición",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/TEJO.jpg",
  },
  {
    id: 5,
    title: "Sabores que enamoran",
    subtitle: "Experiencias gastronómicas en un entorno natural y acogedor",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/RESTAURANTE.jpg",
  },
  {
    id: 6,
    title: "Diversión tradicional",
    subtitle: "Un clásico para disfrutar entre amigos y familiares",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/RANA.jpg",
  },
  {
    id: 7,
    title: "Comodidad garantizada",
    subtitle: "Seguridad y fácil acceso para tu vehículo durante tu estadía",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/PARQUEADERO.jpg",
  },
  {
    id: 8,
    title: "Relajación total",
    subtitle: "Desconéctate en un ambiente de confort",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/JACUZZY.jpg",
  },
  {
    id: 9,
    title: "Pasión en movimiento",
    subtitle: "Vive el deporte al aire libre",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/CANCHAFUTBOL.jpg",
  },
  {
    id: 10,
    title: "Tradición que une",
    subtitle: "Diversión para compartir en grupo",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/BOLIRANA.jpg",
  },
  {
    id: 11,
    title: "Plan perfecto",
    subtitle: "Diversión y buen ambiente en un solo lugar",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/BILLAR.jpg",
  },
  {
    id: 12,
    title: "Momentos para brindar",
    subtitle: "Un espacio para disfrutar y compartir",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/BAR2.jpg",
  },
  {
    id: 13,
    title: "Momentos para compartir",
    subtitle: "Un espacio para disfrutar y compartir momentos especiales con amigos y seres queridos",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/BAR.jpg",
  },
  {
    id: 14,
    title: "Conexiones que importan",
    subtitle: "Espacios diseñados para disfrutar en grupo o en pareja, creando recuerdos inolvidables",
    image: "https://casanova.sfo3.cdn.digitaloceanspaces.com/Imagenes/ZONASVERDES.jpg",
  },
]

export function ZonaSocialSection() {
  const [current, setCurrent] = useState(0)
  const total = zonasSociales.length

  const nextSlide = () => {
    setCurrent((prev) => (prev + 1) % total)
  }

  const prevSlide = () => {
    setCurrent((prev) => (prev - 1 + total) % total)
  }

  useEffect(() => {
    if (total <= 1) return

    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total)
    }, 5000)

    return () => clearInterval(interval)
  }, [total])

  const currentItem = zonasSociales[current]

  const sideCards = useMemo(() => {
  if (total <= 1) return []

  const result = []

  for (let i = 1; i <= Math.min(2, total - 1); i++) {
    result.push(zonasSociales[(current + i) % total])
  }

  return result
}, [current, total])

  return (
    <section id="zonas-sociales" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
            Experiencias exclusivas
          </p>
          <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-5xl">
            Zonas Sociales
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground">
            Conoce nuestras zonas sociales diseñadas para brindarte momentos inolvidables.
            Cada espacio está pensado para ofrecerte comodidad, estilo y una atmósfera ideal
            para compartir, relajarte o disfrutar de un momento especial.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.7fr]">
          {/* Imagen principal */}
          <div className="relative overflow-hidden rounded-3xl shadow-2xl">
            <div className="relative h-[320px] sm:h-[420px] lg:h-[560px]">
              <img
                src={currentItem.image}
                alt={currentItem.title}
                className="h-full w-full object-cover transition-all duration-700"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                <div className="max-w-2xl">
                  <div className="mb-4 flex flex-wrap gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      <Waves className="h-3.5 w-3.5" />
                      Ambiente exclusivo
                    </span>
                    <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium text-white backdrop-blur">
                      <Trees className="h-3.5 w-3.5" />
                      Naturaleza y confort
                    </span>
                  </div>

                  <h3 className="font-serif text-2xl font-bold text-white sm:text-4xl">
                    {currentItem.title}
                  </h3>
                  <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/85 sm:text-base">
                    {currentItem.subtitle}
                  </p>
                </div>
              </div>

              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-4">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={prevSlide}
                  className="rounded-full bg-white/80 text-foreground shadow-lg backdrop-blur hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>

                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={nextSlide}
                  className="rounded-full bg-white/80 text-foreground shadow-lg backdrop-blur hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 hidden rounded-full bg-black/35 px-3 py-1 text-xs text-white backdrop-blur sm:block">
              {current + 1} / {total}
            </div>
          </div>

          {/* Tarjetas laterales */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-1">
            {sideCards.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  const index = zonasSociales.findIndex((z) => z.id === item.id)
                  if (index >= 0) setCurrent(index)
                }}
                className="group overflow-hidden rounded-3xl bg-card text-left shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-48 sm:h-56 lg:h-[267px]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />

                  <div className="absolute bottom-0 p-5">
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs text-white backdrop-blur">
                      <Camera className="h-3.5 w-3.5" />
                      Ver zona
                    </div>
                    <h4 className="text-lg font-bold text-white">{item.title}</h4>
                    <p className="mt-1 line-clamp-2 text-sm text-white/80">
                      {item.subtitle}
                    </p>
                  </div>
                </div>
              </button>
            ))}

            <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-accent">
                <GlassWater className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Espacios destacados
                </span>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Descubre ambientes pensados para el descanso, la conversación y la
                experiencia social. Cada imagen refleja el estilo y la esencia de nuestro hotel.
              </p>

              <div className="mt-5 flex items-center gap-2">
                {zonasSociales.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrent(index)}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-300",
                      index === current
                        ? "w-8 bg-accent"
                        : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}