// utils/price-calculator.ts

/**
 * Calcula el precio total considerando que los niños pagan la mitad
 */
export function calculateRoomPrice(
  pricePerPerson: number,
  adults: number,
  kids: number = 0,
  pets: number = 0
): {
  total: number
  adultsPrice: number
  kidsPrice: number
  petsPrice: number
  kidsDiscount: number
} {
  const adultPrice = pricePerPerson
  const kidPrice = pricePerPerson * 0.7
  const petPrice = 30000 // Precio por mascota por noche

  const adultsTotal = adultPrice * adults
  const kidsTotal = kidPrice * kids
  const petsTotal = petPrice * pets

  return {
    total: adultsTotal + kidsTotal + petsTotal,
    adultsPrice: adultsTotal,
    kidsPrice: kidsTotal,
    petsPrice: petsTotal,
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