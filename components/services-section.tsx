// components/services-section.tsx
"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Expand,
  X,
} from "lucide-react"

import {
  listServicesPublicService,
  type BackendService,
} from "@/services/service.service"
import { formatCurrencyCOP } from "@/utils/format"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog"

const ACCENT_COLOR = "#f4c048"

// Componente fuera para evitar redefinición en cada render
const ServiceCard = ({
  service,
  onOpenGallery,
}: {
  service: BackendService
  onOpenGallery: (service: BackendService) => void
}) => {
  const firstImage = service.images?.[0]?.url || "/LOGO.PNG"

  return (
    <div
      data-service-card
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-card shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
    >
      {/* Imagen clicable con overlay */}
      <div
        className="relative h-48 flex-shrink-0 overflow-hidden cursor-pointer"
        onClick={() => onOpenGallery(service)}
      >
        <img
          src={firstImage}
          alt={service.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Overlay con ícono */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-foreground shadow-lg">
              <Expand className="h-4 w-4" />
              Ver galería
            </span>
          </div>
        </div>

        {/* Badge de contador */}
        {service.images && service.images.length > 1 && (
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-1 text-xs text-white">
            {service.images.length} fotos
          </div>
        )}

        {/* Degradado */}
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
          {service.description || service.decription}
        </p>
      </div>
    </div>
  )
}

export function ServicesSection() {
  const [services, setServices] = useState<BackendService[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)

  // Estado para la galería modal
  const [selectedService, setSelectedService] = useState<BackendService | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const carouselRef = useRef<HTMLDivElement>(null)

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

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, totalSlides)))
  }, [totalSlides])

  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide])
  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide])

  // Handlers con umbral para no interferir con clics
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 1.5

    // Umbral de 5px: solo desplaza si el movimiento es significativo
    if (Math.abs(walk) < 5) return

    e.preventDefault()
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
        behavior: "smooth",
      })
    }
  }, [currentSlide])

  // Funciones para la galería modal
  const openGallery = useCallback((service: BackendService) => {
    setSelectedService(service)
    setCurrentImageIndex(0)
  }, [])

  const closeGallery = useCallback(() => {
    setSelectedService(null)
    setCurrentImageIndex(0)
  }, [])

  const nextImage = useCallback(() => {
    if (!selectedService?.images?.length) return
    setCurrentImageIndex((prev) =>
      prev >= selectedService.images.length - 1 ? 0 : prev + 1
    )
  }, [selectedService?.images?.length])

  const prevImage = useCallback(() => {
    if (!selectedService?.images?.length) return
    setCurrentImageIndex((prev) =>
      prev <= 0 ? selectedService.images.length - 1 : prev - 1
    )
  }, [selectedService?.images?.length])

  useEffect(() => {
    if (!selectedService) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage()
      if (e.key === "ArrowLeft") prevImage()
      if (e.key === "Escape") closeGallery()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedService, nextImage, prevImage, closeGallery])

  const currentImage = selectedService?.images?.[currentImageIndex]?.url

  return (
    <section id="services" className="py-20 px-4">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center space-y-6">
          <div className="inline-flex items-center justify-center">
            <span className="rounded-full bg-accent px-5 py-2 text-xs font-bold uppercase tracking-[0.25em] text-accent-foreground border-2 border-accent-foreground/20 shadow-xl transition-shadow hover:shadow-lg">
              Experiencias exclusivas
            </span>
          </div>

          <h2 className="font-serif text-4xl font-extrabold tracking-tight text-foreground md:text-6xl lg:text-7xl text-balance">
            Servicios Adicionales
          </h2>
          <p className="mx-auto max-w-3xl text-lg md:text-xl font-medium leading-relaxed text-foreground/90">
            Disfrute de una gama completa de servicios diseñados para hacer de su
            estancia una{" "}
            <span className="font-bold text-accent">experiencia</span> inolvidable{" "}
            <span className="font-bold text-foreground">agregados a tu reserva.</span>
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="flex flex-col items-center gap-3">
              <div
                className="h-8 w-8 animate-spin rounded-full border-2"
                style={{
                  borderColor: `${ACCENT_COLOR}40`,
                  borderTopColor: ACCENT_COLOR,
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
                  <ServiceCard service={service} onOpenGallery={openGallery} />
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
                    backgroundColor:
                      index === currentSlide ? ACCENT_COLOR : `${ACCENT_COLOR}40`,
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
            <Sparkles
              className="mx-auto h-10 w-10 opacity-40"
              style={{ color: ACCENT_COLOR }}
            />
            <p className="mt-4 text-sm text-muted-foreground">
              No hay servicios disponibles en este momento.
            </p>
          </div>
        )}

        {/*  Galería Modal Global */}
        <Dialog open={!!selectedService} onOpenChange={(open) => !open && closeGallery()}>
          <DialogContent className="max-w-5xl p-0 overflow-hidden bg-background">
            <DialogHeader className="sr-only">
              <DialogTitle>Galería de {selectedService?.name}</DialogTitle>
            </DialogHeader>

            {selectedService && (
              <div className="relative">
                <div className="aspect-video w-full bg-black">
                  <img
                    src={currentImage || "/LOGO.PNG"}
                    alt={`${selectedService.name} - Foto ${currentImageIndex + 1}`}
                    className="h-full w-full object-contain"
                  />
                </div>

                <button
                  onClick={closeGallery}
                  className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                  aria-label="Cerrar galería"
                >
                  <X className="h-5 w-5" />
                </button>

                {selectedService.images && selectedService.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                      aria-label="Foto anterior"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>

                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white transition-colors hover:bg-black/70"
                      aria-label="Foto siguiente"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>

                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-sm text-white">
                      {currentImageIndex + 1} / {selectedService.images.length}
                    </div>
                  </>
                )}

                <div className="absolute bottom-4 left-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-medium text-white">
                  {selectedService.name}
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}