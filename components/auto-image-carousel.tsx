//components/auto-image-carousel.tsx

"use client"

import { useEffect, useMemo, useState } from "react"
import { cn } from "@/lib/utils"

type ImageItem =
  | string
  | {
      id?: string
      url: string
    }

export function AutoImageCarousel({
  images,
  alt,
  fallback = "/placeholder.svg",
  interval = 3500,
  className,
  showDots = true,
}: {
  images?: ImageItem[]
  alt: string
  fallback?: string
  interval?: number
  className?: string
  showDots?: boolean
}) {
  const normalizedImages = useMemo(() => {
    const urls =
      (images ?? [])
        .map((img) => (typeof img === "string" ? img : img?.url))
        .filter(Boolean) ?? []

    return urls.length > 0 ? urls : [fallback]
  }, [images, fallback])

  const [current, setCurrent] = useState(0)
  const total = normalizedImages.length

  useEffect(() => {
    setCurrent(0)
  }, [normalizedImages])

  useEffect(() => {
    if (total <= 1) return

    const id = setInterval(() => {
      setCurrent((prev) => (prev + 1) % total)
    }, interval)

    return () => clearInterval(id)
  }, [total, interval])

  return (
    <div className={cn("relative h-full w-full overflow-hidden", className)}>
      {normalizedImages.map((src, index) => (
        <img
          key={`${src}-${index}`}
          src={src}
          alt={alt}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            index === current ? "opacity-100" : "opacity-0"
          )}
        />
      ))}

      {showDots && total > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-black/25 px-2 py-1 backdrop-blur-sm">
          {normalizedImages.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => setCurrent(index)}
              className={cn(
                "h-2 rounded-full transition-all",
                index === current ? "w-5 bg-white" : "w-2 bg-white/60"
              )}
              aria-label={`Ir a imagen ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}