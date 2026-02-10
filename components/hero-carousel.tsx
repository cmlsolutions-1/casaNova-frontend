// components/hero-carousel.tsx
"use client"

import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

type HeroCarouselProps = {
  images: string[]
}

export function HeroCarousel({ images }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0)

  const safeImages = images?.filter(Boolean) ?? []
  const hasImages = safeImages.length > 0

  const next = useCallback(() => {
    if (!hasImages) return
    setCurrent((prev) => (prev + 1) % safeImages.length)
  }, [hasImages, safeImages.length])

  useEffect(() => {
    if (!hasImages) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, hasImages])

  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      {(hasImages ? safeImages : ["/placeholder.svg"]).map((src, i) => (
        <div
          key={`${src}-${i}`}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0",
          )}
        >
          <img
            src={src}
            alt={`Casa Nova Hotel Campestre vista ${i + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/70" />


      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
      <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/90 drop-shadow md:text-base">
  Bienvenido a
</p>

        <h1 className="font-serif text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl text-balance">
          Casa Nova
          <br />
          <span className="text-white">Hotel Campestre</span>
        </h1>
        <p className="mt-4 max-w-xl text-base font-medium leading-relaxed text-white/90 drop-shadow-md md:text-lg">
          Donde el lujo se encuentra con la serenidad. Descubra una experiencia unica de hospitalidad y confort.
        </p>
      </div>

      {hasImages && (
        <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
          {safeImages.map((_, i) => (
            <button
              key={`dot-${safeImages[i]}`}
              type="button"
              onClick={() => setCurrent(i)}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                i === current ? "w-8 bg-accent" : "w-2 bg-white/50 hover:bg-white/80",
              )}
              aria-label={`Ir a imagen ${i + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
