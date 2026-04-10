"use client"

import Link from "next/link"
import { useEffect, useState, useRef, useCallback } from "react"
import { CalendarDays, PartyPopper, SunMedium, Clock, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrencyCOP } from "@/utils/format"
import {
  listServicesPublicService,
  type BackendService,
} from "@/services/service.service"
import { AutoImageCarousel } from "@/components/auto-image-carousel"
import { cn } from "@/lib/utils"

const ACCENT_COLOR = "#f4c048"

// Extraer capacidad del nombre para EVENT_HALL
function getEventHallCapacity(serviceName: string): number {
  const match = serviceName.match(/(\d+)\s*(personas|personas?)/i)
  if (match && match[1]) {
    return parseInt(match[1], 10)
  }
  return 150 // valor por defecto
}

// Meta información corregida
function getExtraServiceMeta(service: BackendService) {
  const name = service.name.toLowerCase()

  if (name.includes("salon") || name.includes("salón")) {
    const capacity = getEventHallCapacity(service.name)
    return {
      kind: "EVENT_HALL" as const,
      icon: PartyPopper,
      peopleText: `Capacidad: ${capacity} personas`,
      extra: "Horario: 6:00 pm a 3:00 am",
      fallbackImage: "/salon-eventos.jpg",
    }
  }

  // DAY_PASS
  return {
    kind: "DAY_PASS" as const,
    icon: SunMedium,
    peopleText: "Máximo 100 personas",
    extra: "Mínimo 10 personas • $25.000 por persona",
    fallbackImage: "/pasadia.jpg",
  }
}

export function ServicesOtherDay() {
  const [services, setServices] = useState<BackendService[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  const carouselRef = useRef<HTMLDivElement>(null)

  const slidesToShow = 3
  const totalSlides = Math.max(0, Math.ceil(services.length / slidesToShow) - 1)

  useEffect(() => {
    let alive = true

    ;(async () => {
      try {
        const data = await listServicesPublicService()
        if (!alive) return

        const filtered = (data ?? []).filter(
          (service) => service.status === "ACTIVE" && service.type === "DAY_PASS"
        )

        setServices(filtered)
      } catch {
        if (!alive) return
        setServices([])
      } finally {
        if (alive) setLoading(false)
      }
    })()

    return () => {
      alive = false
    }
  }, [])

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, totalSlides)))
  }, [totalSlides])

  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide])
  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide])

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement
    if (target.closest("button") || target.closest("a") || target.closest("input")) {
      return
    }
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 1.5
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => setIsDragging(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide()
      if (e.key === "ArrowRight") nextSlide()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [prevSlide, nextSlide])

  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.querySelector("[data-service-card]")?.clientWidth || 0
      const gap = 24
      carouselRef.current.scrollTo({
        left: currentSlide * (cardWidth + gap) * slidesToShow,
        behavior: "smooth"
      })
    }
  }, [currentSlide])

  const ServiceCard = ({ service }: { service: BackendService }) => {
    const meta = getExtraServiceMeta(service)
    const Icon = meta.icon

    return (
      <div
        data-service-card
        className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      >
        <div className="relative h-48 flex-shrink-0 overflow-hidden">
          <AutoImageCarousel
            images={service.images}
            alt={service.name}
            fallback={meta.fallbackImage}
            interval={3500}
            showDots={(service.images?.length ?? 0) > 1}
            className="h-full w-full"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          
          <div className="absolute bottom-4 left-4 flex items-center gap-2">
            <div 
              className="flex h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: ACCENT_COLOR }}
            >
              <Icon className="h-5 w-5 text-black" />
            </div>
            <span className="text-lg font-bold text-white">
              {formatCurrencyCOP(service.price)}
            </span>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-5">
          <h3 className="text-lg font-bold text-card-foreground">{service.name}</h3>
          
          <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-3">
            {service.description || service.decription}
          </p>

          <div className="mt-4 space-y-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" style={{ color: ACCENT_COLOR }} />
              <span>{meta.peopleText}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: ACCENT_COLOR }} />
              <span>{meta.extra}</span>
            </div>
          </div>

          <Button 
            asChild 
            className="mt-4 w-full rounded-xl font-semibold transition-all hover:opacity-90"
            style={{ 
              backgroundColor: ACCENT_COLOR,
              color: "#000"
            }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <Link href={`/booking/extra-service/${service.id}`}>
              <CalendarDays className="mr-2 h-4 w-4" />
              Reservar ahora
            </Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <section id="services-other" className="px-4 py-20">
      <div className="mx-auto max-w-7xl">
        <div className="mb-12 text-center">
          <p 
            className="mb-2 text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: ACCENT_COLOR }}
          >
            Tenemos más servicios para ti
          </p>
          <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-5xl">
            Otros servicios
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Disfruta de nuestro servicio de pasadía o reserva el salón de eventos
            para compartir un día diferente con familia y amigos.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div 
                className="h-8 w-8 animate-spin rounded-full border-2"
                style={{ 
                  borderColor: `${ACCENT_COLOR}40`,
                  borderTopColor: ACCENT_COLOR 
                }}
              />
              <p className="text-sm text-muted-foreground">Cargando servicios...</p>
            </div>
          </div>
        )}

        {!loading && services.length > 0 && (
          <div className="relative">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={cn(
                "absolute left-0 top-1/2 z-10 flex h-10 w-10 -translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-lg transition-all duration-200 md:-translate-x-6",
                currentSlide === 0 
                  ? "cursor-not-allowed opacity-0" 
                  : "hover:scale-110 hover:shadow-xl"
              )}
              style={{ display: currentSlide === 0 ? "none" : "flex" }}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <div
              ref={carouselRef}
              className="flex gap-6 overflow-x-auto scroll-smooth pb-4 scrollbar-hide"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  className="w-full flex-shrink-0 sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)]"
                >
                  <ServiceCard service={service} />
                </div>
              ))}
            </div>

            <button
              onClick={nextSlide}
              disabled={currentSlide >= totalSlides}
              className={cn(
                "absolute right-0 top-1/2 z-10 flex h-10 w-10 translate-x-4 -translate-y-1/2 items-center justify-center rounded-full bg-card shadow-lg transition-all duration-200 md:translate-x-6",
                currentSlide >= totalSlides 
                  ? "cursor-not-allowed opacity-0" 
                  : "hover:scale-110 hover:shadow-xl"
              )}
              style={{ display: currentSlide >= totalSlides ? "none" : "flex" }}
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: totalSlides + 1 }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    index === currentSlide ? "w-6" : "w-2"
                  )}
                  style={{ 
                    backgroundColor: index === currentSlide ? ACCENT_COLOR : `${ACCENT_COLOR}40`
                  }}
                  aria-label={`Ir a slide ${index + 1}`}
                />
              ))}
              <span className="ml-3 text-xs text-muted-foreground">
                {currentSlide + 1} de {totalSlides + 1}
              </span>
            </div>
          </div>
        )}

        {!loading && services.length === 0 && (
          <div className="rounded-2xl bg-muted/50 py-16 text-center">
            <SunMedium 
              className="mx-auto h-10 w-10 opacity-40" 
              style={{ color: ACCENT_COLOR }}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}