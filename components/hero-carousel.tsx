"use client"

import { useState, useEffect, useCallback } from "react"
import { heroImages } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

export function HeroCarousel() {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % heroImages.length)
  }, [])

  useEffect(() => {
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next])

  return (
    <div className="relative h-[100svh] w-full overflow-hidden">
      {heroImages.map((src, i) => (
        <div
          key={src}
          className={cn(
            "absolute inset-0 transition-opacity duration-1000",
            i === current ? "opacity-100" : "opacity-0",
          )}
        >
          <img
            src={src || "/placeholder.svg"}
            alt={`Casa Nova Hotel Campestre vista ${i + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ))}

      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/60" />

      <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.3em] text-accent md:text-base">
          Bienvenido a
        </p>
        <h1 className="font-serif text-5xl font-bold leading-tight text-white md:text-7xl lg:text-8xl text-balance">
        Casa Nova
          <br />
          <span className="text-accent">Hotel Campestre</span>
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
          Donde el lujo se encuentra con la serenidad. Descubra una experiencia
          unica de hospitalidad y confort.
        </p>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        {heroImages.map((_, i) => (
          <button
            key={`dot-${heroImages[i]}`}
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
    </div>
  )
}
