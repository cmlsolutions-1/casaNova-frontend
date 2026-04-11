// components/description-parser.tsx
"use client"

import React from "react"

interface DescriptionParserProps {
  text: string
  className?: string
}

/**
 * Parser que separa el texto por emojis/iconos visuales.
 * Usa \p{Extended_Pictographic} para evitar que números y símbolos 
 * como # o * sean tratados como emojis.
 */
export function DescriptionParser({ text, className = "" }: DescriptionParserProps) {
  if (!text) return null

  // Regex corregida: solo emojis gráficos, NO números
  const parts = text.split(/(?=\p{Extended_Pictographic})/u)

  return (
    <div className={`space-y-2 ${className}`}>
      {parts.map((part, index) => {
        const trimmed = part.trim()
        if (!trimmed) return null

        return (
          <p
            key={index}
            className="text-justify hyphens-auto leading-relaxed text-muted-foreground"
          >
            {trimmed}
          </p>
        )
      })}
    </div>
  )
}