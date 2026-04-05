// utils/price-calculator.ts

/**
 * Calcula el precio total considerando que los niños pagan la mitad
 */
export function calculateRoomPrice(
  pricePerPerson: number,
  adults: number,
  kids: number = 0
): {
  total: number
  adultsPrice: number
  kidsPrice: number
  kidsDiscount: number
} {
  const adultPrice = pricePerPerson
  const kidPrice = pricePerPerson * 0.5

  const adultsTotal = adultPrice * adults
  const kidsTotal = kidPrice * kids

  return {
    total: adultsTotal + kidsTotal,
    adultsPrice: adultsTotal,
    kidsPrice: kidsTotal,
    kidsDiscount: kids > 0 ? (adultPrice - kidPrice) * kids : 0,
  }
}

/**
 * Formatea precio en COP
 */
export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount)
}