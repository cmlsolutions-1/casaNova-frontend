//utils/format.ts

export function formatCurrencyCOP(value: number | string) {
  const numericValue = Number(value)

  if (Number.isNaN(numericValue)) return "$0"

  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(numericValue)
}