//lib/mock-data.ts
export interface Room {
  id: string
  type: "sencilla" | "doble" | "multiple" | "suite"
  name: string
  description: string
  singleBeds: number
  doubleBeds: number
  capacity: number
  price: number
  images: string[]
  petFriendly: boolean
  breakfastIncluded: boolean
  oceanView: boolean
  amenities: string[]
  status: "available" | "occupied" | "maintenance"
}

export interface Service {
  id: string
  name: string
  description: string
  price: number
  icon: string
  status: "active" | "inactive"
  images: string[]
  hasSchedule: boolean
  maxAmount: number
}

export interface User {
  id: string
  email: string
  password: string
  name: string
  role: "ADMIN" | "EMPLOYEE"
}

export interface GuestInfo {
  name: string
  email: string
  phone: string
  documentNumber: string
  documentType: string
  address: string
  birthDay: string
}

export interface SelectedService {
  serviceId: string
  amount: number
  startHour?: string
  endHour?: string
}

export interface Reservation {
  id: string
  roomId: string
  guestInfo: GuestInfo
  startDate: string
  endDate: string
  adults: number
  kids: number
  babies: number
  pets: number
  services: SelectedService[]
  totalPrice: number
  status: "PENDING" | "PAID_PENDING_APPROVAL" | "APPROVED" | "REJECTED"
  createdAt: string
}

export interface Payment {
  id: string
  reservationId: string
  amount: number
  method: "card" | "pse" | "cash"
  status: "paid" | "pending" | "rejected"
  createdAt: string
}

export const rooms: Room[] = [
  {
    id: "room-1",
    type: "sencilla",
    name: "Habitacion Clasica",
    description: "Una habitacion elegante con todas las comodidades modernas. Perfecta para viajeros solitarios o parejas que buscan una estancia confortable con vistas al jardin interior.",
    singleBeds: 1,
    doubleBeds: 0,
    capacity: 1,
    price: 120,
    images: [
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop",
    ],
    petFriendly: false,
    breakfastIncluded: false,
    oceanView: false,
    amenities: ["WiFi", "TV", "Aire acondicionado", "Minibar", "Caja fuerte"],
    status: "available",
  },
  {
    id: "room-2",
    type: "doble",
    name: "Habitacion Deluxe Doble",
    description: "Espaciosa habitacion con cama doble king size, banera de hidromasaje y balcon privado. Ideal para parejas que desean una experiencia romantica inolvidable.",
    singleBeds: 0,
    doubleBeds: 1,
    capacity: 2,
    price: 220,
    images: [
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1564078516393-cf04bd966897?w=800&h=600&fit=crop",
    ],
    petFriendly: false,
    breakfastIncluded: true,
    oceanView: true,
    amenities: ["WiFi", "TV 55\"", "Aire acondicionado", "Minibar premium", "Caja fuerte", "Balcon", "Banera hidromasaje", "Albornoz"],
    status: "available",
  },
  {
    id: "room-3",
    type: "multiple",
    name: "Habitacion Familiar Premium",
    description: "Amplia habitacion con multiples camas perfecta para familias. Incluye area de estar separada y todo lo necesario para una estancia familiar perfecta.",
    singleBeds: 2,
    doubleBeds: 1,
    capacity: 4,
    price: 350,
    images: [
      "https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=800&h=600&fit=crop",
    ],
    petFriendly: true,
    breakfastIncluded: true,
    oceanView: false,
    amenities: ["WiFi", "TV 55\"", "Aire acondicionado", "Minibar", "Caja fuerte", "Area de estar", "Microondas", "Pet friendly"],
    status: "available",
  },
  {
    id: "room-4",
    type: "suite",
    name: "Suite Presidencial",
    description: "La maxima expresion del lujo. Suite de 120m2 con sala de estar, comedor privado, jacuzzi, terraza panoramica y servicio de mayordomo personalizado.",
    singleBeds: 0,
    doubleBeds: 2,
    capacity: 4,
    price: 750,
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop",
    ],
    petFriendly: true,
    breakfastIncluded: true,
    oceanView: true,
    amenities: ["WiFi premium", "Smart TV 65\"", "Aire acondicionado dual", "Minibar premium", "Caja fuerte XL", "Terraza", "Jacuzzi", "Mayordomo", "Comedor privado", "Albornoz y zapatillas"],
    status: "available",
  },
  {
    id: "room-5",
    type: "doble",
    name: "Habitacion Superior",
    description: "Habitacion con diseno contemporaneo, cama queen y vista parcial al mar. El equilibrio perfecto entre confort y precio.",
    singleBeds: 0,
    doubleBeds: 1,
    capacity: 2,
    price: 180,
    images: [
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?w=800&h=600&fit=crop",
    ],
    petFriendly: false,
    breakfastIncluded: false,
    oceanView: true,
    amenities: ["WiFi", "TV 50\"", "Aire acondicionado", "Minibar", "Caja fuerte", "Vista al mar"],
    status: "available",
  },
  {
    id: "room-6",
    type: "suite",
    name: "Junior Suite",
    description: "Suite elegante con sala de estar integrada y vistas espectaculares. Perfecta para quienes buscan un toque extra de sofisticacion.",
    singleBeds: 0,
    doubleBeds: 1,
    capacity: 3,
    price: 450,
    images: [
      "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1591088398332-8a7791972843?w=800&h=600&fit=crop",
    ],
    petFriendly: false,
    breakfastIncluded: true,
    oceanView: true,
    amenities: ["WiFi premium", "Smart TV 55\"", "Aire acondicionado", "Minibar premium", "Caja fuerte", "Sala de estar", "Banera", "Albornoz"],
    status: "available",
  },
]

export const services: Service[] = [
  {
    id: "srv-1",
    name: "Spa & Bienestar",
    description: "Masajes relajantes, tratamientos faciales y circuito de aguas termales para una experiencia de relajacion total.",
    price: 85,
    icon: "Sparkles",
    status: "active",
    images: ["https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=400&h=300&fit=crop"],
    hasSchedule: true,
    maxAmount: 4,
  },
  {
    id: "srv-2",
    name: "Desayuno Buffet",
    description: "Desayuno gourmet con productos locales y organicos, cocina en vivo y opciones para todos los gustos.",
    price: 35,
    icon: "Coffee",
    status: "active",
    images: ["https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop"],
    hasSchedule: false,
    maxAmount: 10,
  },
  {
    id: "srv-3",
    name: "Transporte Aeropuerto",
    description: "Servicio de transporte privado de lujo desde y hacia el aeropuerto en vehiculo premium con chofer.",
    price: 60,
    icon: "Car",
    status: "active",
    images: ["https://images.unsplash.com/photo-1449965408869-ebd3fee7416f?w=400&h=300&fit=crop"],
    hasSchedule: false,
    maxAmount: 2,
  },
  {
    id: "srv-4",
    name: "Tour Ciudad",
    description: "Recorrido guiado por los principales atractivos turisticos de la ciudad con guia bilingue experto.",
    price: 75,
    icon: "Map",
    status: "active",
    images: ["https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=400&h=300&fit=crop"],
    hasSchedule: true,
    maxAmount: 6,
  },
  {
    id: "srv-5",
    name: "Late Checkout",
    description: "Extienda su estancia hasta las 4:00 PM para disfrutar mas tiempo de las instalaciones del hotel.",
    price: 45,
    icon: "Clock",
    status: "active",
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=400&h=300&fit=crop"],
    hasSchedule: false,
    maxAmount: 1,
  },
  {
    id: "srv-6",
    name: "Cena Romantica",
    description: "Cena privada a la luz de las velas en terraza con vista al mar, menu de 5 tiempos y maridaje.",
    price: 150,
    icon: "Wine",
    status: "active",
    images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=400&h=300&fit=crop"],
    hasSchedule: true,
    maxAmount: 2,
  },
]

export const users: User[] = [
  {
    id: "user-1",
    email: "admin@grandluxe.com",
    password: "admin123",
    name: "Carlos Administrador",
    role: "ADMIN",
  },
  {
    id: "user-2",
    email: "empleado@grandluxe.com",
    password: "emp123",
    name: "Maria Recepcion",
    role: "EMPLOYEE",
  },
]

export const mockReservations: Reservation[] = [
  {
    id: "res-1001",
    roomId: "room-2",
    guestInfo: {
      name: "Juan Perez",
      email: "juan@email.com",
      phone: "+57 300 123 4567",
      documentNumber: "1234567890",
      documentType: "CC",
      address: "Calle 100 #15-30, Bogota",
      birthDay: "1990-05-15",
    },
    startDate: "2026-03-01",
    endDate: "2026-03-05",
    adults: 2,
    kids: 0,
    babies: 0,
    pets: 0,
    services: [{ serviceId: "srv-1", amount: 2 }, { serviceId: "srv-2", amount: 4 }],
    totalPrice: 1150,
    status: "APPROVED",
    createdAt: "2026-02-01",
  },
  {
    id: "res-1002",
    roomId: "room-4",
    guestInfo: {
      name: "Laura Gomez",
      email: "laura@email.com",
      phone: "+57 310 987 6543",
      documentNumber: "0987654321",
      documentType: "CC",
      address: "Carrera 7 #45-12, Medellin",
      birthDay: "1985-11-22",
    },
    startDate: "2026-02-10",
    endDate: "2026-02-14",
    adults: 2,
    kids: 2,
    babies: 0,
    pets: 1,
    services: [{ serviceId: "srv-3", amount: 1 }, { serviceId: "srv-6", amount: 1 }],
    totalPrice: 3210,
    status: "PAID_PENDING_APPROVAL",
    createdAt: "2026-01-28",
  },
]

export const heroImages = [
  "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1600&h=900&fit=crop",
  "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1600&h=900&fit=crop",
]
