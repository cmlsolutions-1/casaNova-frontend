//utils/season-validator.ts

import type { BackendSeason } from "@/services/season.service"

function normalizeDate(value?: string | null) {
  if (!value) return ""
  return value.split("T")[0]
}

export function getNightsBetweenDates(start: string, end: string) {
  const startDate = new Date(`${start}T12:00:00`)
  const endDate = new Date(`${end}T12:00:00`)

  return Math.max(
    1,
    Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)
  )
}

export function validateSeasonMinimumNights(params: {
  start: string
  end: string
  seasons: BackendSeason[]
}) {
  const checkIn = new Date(`${params.start}T12:00:00`)
  const checkOut = new Date(`${params.end}T12:00:00`)
  const nights = getNightsBetweenDates(params.start, params.end)

  const activeSeasons = params.seasons.filter((s) => s.status === "ACTIVE")

  for (const season of activeSeasons) {
    let applies = false

    if (season.type === "KEY_DATE" && season.keyDate) {
      const keyDate = new Date(`${normalizeDate(season.keyDate)}T12:00:00`)
      applies = keyDate >= checkIn && keyDate < checkOut
    }

    if (season.type === "DATE_RANGE" && season.startDate && season.endDate) {
      const seasonStart = new Date(`${normalizeDate(season.startDate)}T12:00:00`)
      const seasonEnd = new Date(`${normalizeDate(season.endDate)}T12:00:00`)

      applies = checkIn <= seasonEnd && checkOut > seasonStart
    }

    if (applies && nights < Number(season.minimumNights ?? 1)) {
      return {
        valid: false,
        nights,
        season,
        message: `Para ${season.name}, la reserva mínima es de ${season.minimumNights} noche${
          season.minimumNights > 1 ? "s" : ""
        }. Actualmente seleccionaste ${nights} noche${nights > 1 ? "s" : ""}.`,
      }
    }
  }

  return {
    valid: true,
    nights,
    season: null,
    message: "",
  }
}