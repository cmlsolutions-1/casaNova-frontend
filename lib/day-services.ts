//lib/day-services.ts

export type ExtraBookingType = "DAY_PASS" | "EVENT_HALL"

export type ExtraBookingConfig = {
  type: ExtraBookingType
  title: string
  description: string
  basePrice: number
  minPeople?: number
  maxPeople?: number
  additionalPersonPrice?: number
  schedule?: string
  serviceId: string
}

export const EXTRA_BOOKING_OPTIONS: Record<ExtraBookingType, ExtraBookingConfig> = {
  DAY_PASS: {
    type: "DAY_PASS",
    title: "Pasadía",
    description:
      "Disfruta de un día especial con acceso a nuestras instalaciones. Mínimo 10 personas.",
    basePrice: 500000,
    minPeople: 20,
    additionalPersonPrice: 25000,
    serviceId: "DAY_PASS_SERVICE",
  },
  EVENT_HALL: {
    type: "EVENT_HALL",
    title: "Salón de eventos",
    description:
      "Reserva nuestro salón social para celebraciones, reuniones y eventos especiales.",
    basePrice: 2000000,
    maxPeople: 150,
    schedule: "7:00 pm a 2:30 am",
    serviceId: "EVENT_HALL_SERVICE",
  },
}