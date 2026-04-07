//components/services-section.tsx

"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

import { listServicesPublicService, type BackendService } from "@/services/service.service"
import { formatCurrencyCOP } from "@/utils/format"
import { AutoImageCarousel } from "@/components/auto-image-carousel"
import { cn } from "@/lib/utils"

// Tu color accent preferido
const ACCENT_COLOR = "#f4c048"

export function ServicesSection() {
  const [services, setServices] = useState<BackendService[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  
  const carouselRef = useRef<HTMLDivElement>(null)

  // Servicios por slide en desktop
  const slidesToShow = 3
  const totalSlides = Math.max(0, Math.ceil(services.length / slidesToShow) - 1)

  useEffect(() => {
    let alive = true
    setLoading(true)

    ;(async () => {
      try {
        const data = await listServicesPublicService()
        if (!alive) return

        const filtered = (data ?? []).filter(
          (service) => service.status === "ACTIVE" && service.type === "STAY"
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

  // Navegación del carrusel
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, totalSlides)))
  }, [totalSlides])

  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide])
  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide])

  // Handlers para drag/swipe
  const handleMouseDown = (e: React.MouseEvent) => {
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

  // Soporte teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prevSlide()
      if (e.key === "ArrowRight") nextSlide()
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [prevSlide, nextSlide])

  // Scroll automático al cambiar slide
  useEffect(() => {
    if (carouselRef.current) {
      const cardWidth = carouselRef.current.querySelector("[data-service-card]")?.clientWidth || 0
      const gap = 24 // gap-6 = 1.5rem = 24px
      carouselRef.current.scrollTo({
        left: currentSlide * (cardWidth + gap) * slidesToShow,
        behavior: "smooth"
      })
    }
  }, [currentSlide])

  const ServiceCard = ({ service }: { service: BackendService }) => (
    <div
      data-service-card
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Imagen */}
      <div className="relative h-48 flex-shrink-0 overflow-hidden">
        <AutoImageCarousel
          images={service.images}
          alt={service.name}
          fallback="/LOGO.PNG"
          interval={3400}
          showDots={(service.images?.length ?? 0) > 1}
          className="h-full w-full"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        
        {/* Icono y precio */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2">
          <div 
            className="flex h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: ACCENT_COLOR }}
          >
            <Sparkles className="h-5 w-5 text-black" />
          </div>
          <span className="text-lg font-bold text-white">
            Desde {formatCurrencyCOP(service.price)} COP
          </span>
        </div>
      </div>

      {/* Contenido */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-card-foreground">{service.name}</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {service.decription}
        </p>
      </div>
    </div>
  )

  return (
    <section id="services" className="py-20 px-4">
      <div className="mx-auto max-w-7xl">
        {/* Header centrado como antes */}
        <div className="mb-12 text-center">
          <p 
            className="mb-2 text-sm font-semibold uppercase tracking-[0.2em]"
            style={{ color: ACCENT_COLOR }}
          >
            Experiencias exclusivas
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-5xl text-balance">
            Servicios Adicionales
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Disfrute de una gama completa de servicios diseñados para hacer de su
            estancia una experiencia inolvidable agregados a tu reserva.
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

        {/* Carrusel */}
        {!loading && services.length > 0 && (
          <div className="relative">
            {/* Botón anterior */}
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

            {/* Carrusel contenedor */}
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

            {/* Botón siguiente */}
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

            {/* Indicadores */}
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

        {/* Empty state */}
        {!loading && services.length === 0 && (
          <div className="rounded-2xl bg-muted/50 py-16 text-center">
            <Sparkles 
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