// Types
export interface Room {
  id: string
  name: string
  type: string
  basePrice: number
}

export interface CustomPrice {
  roomId: string
  date: string
  price: number
}

export interface RoomBlock {
  roomId: string
  date: string
  reason: string
}

export interface SpecialSeason {
  id: string
  name: string
  keyDate?: string
  startDate?: string
  endDate?: string
  minimumNights: number
  description: string
  active: boolean
}

// Mock Data
export const rooms: Room[] = [
  {
    id: "101",
    name: "Habitación 101",
    type: "Estándar",
    basePrice: 50000,
  },
  {
    id: "102",
    name: "Habitación 102",
    type: "Doble",
    basePrice: 65000,
  },
  {
    id: "suite-premium",
    name: "Suite Premium",
    type: "Suite",
    basePrice: 120000,
  },
]

export const initialCustomPrices: CustomPrice[] = [
  {
    roomId: "101",
    date: "2026-04-20",
    price: 80000,
  },
  {
    roomId: "101",
    date: "2026-04-21",
    price: 80000,
  },
  {
    roomId: "101",
    date: "2026-04-25",
    price: 80000,
  },
  {
    roomId: "101",
    date: "2026-07-24",
    price: 100000,
  },
]

export const initialBlocks: RoomBlock[] = [
  {
    roomId: "102",
    date: "2026-04-10",
    reason: "Mantenimiento",
  },
  {
    roomId: "102",
    date: "2026-04-11",
    reason: "Mantenimiento",
  },
  {
    roomId: "102",
    date: "2026-04-12",
    reason: "Limpieza profunda",
  },
]

export const initialSpecialSeasons: SpecialSeason[] = [
  {
    id: "navidad",
    name: "Navidad",
    keyDate: "2026-12-24",
    minimumNights: 3,
    description: "Reservas que incluyan el 24 de diciembre requieren mínimo 3 noches.",
    active: true,
  },
  {
    id: "fin-ano",
    name: "Fin de año",
    keyDate: "2026-12-31",
    minimumNights: 3,
    description: "Reservas que incluyan el 31 de diciembre requieren mínimo 3 noches.",
    active: true,
  },
  {
    id: "semana-santa",
    name: "Semana Santa",
    startDate: "2026-04-02",
    endDate: "2026-04-05",
    minimumNights: 2,
    description: "Temporada de alta demanda con mínimo de 2 noches.",
    active: true,
  },
]

export const blockReasons = [
  "Mantenimiento",
  "Limpieza profunda",
  "Uso interno",
  "Fuera de servicio",
  "Otro",
]

// Utility functions
export function formatCOP(value: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0]
}

export function getMonthName(month: number): string {
  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ]
  return months[month]
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

export function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay()
}
