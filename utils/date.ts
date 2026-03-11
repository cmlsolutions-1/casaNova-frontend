//utils/date.ts
export function formatDateSpanish(date: string) {
  if (!date) return "Fecha no disponible"

  const parsed = new Date(date)

  if (Number.isNaN(parsed.getTime())) return "Fecha no válida"

  return parsed.toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  })
}