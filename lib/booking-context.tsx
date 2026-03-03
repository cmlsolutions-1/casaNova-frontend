//lib/booking-context.tsx

"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { Room, GuestInfo, SelectedService, Reservation, Payment } from "./mock-data"
import { rooms as defaultRooms, services as defaultServices, mockReservations, users as defaultUsers } from "./mock-data"
import type { Service, User } from "./mock-data"

import { loginService, logoutService } from "@/services/auth.service"

import type { Role } from "@/lib/rbac"

import { authStorage } from "@/lib/auth-storage"
import { decodeJwt } from "@/lib/jwt"
import { refreshService } from "@/services/auth.service"


import type { BackendRoom } from "@/services/room.service"
import type { BackendService } from "@/services/service.service"


interface SearchParams {
  startDate: string
  endDate: string
  adults: number
  kids: number
  babies: number
  pets: number
}

interface BookingState {
  searchParams: SearchParams | null
  selectedRooms: Room[]
  selectedServices: SelectedService[]
  guestInfo: GuestInfo | null
}

interface AdminAuth {
  isAuthenticated: boolean
  user: User | null
}

interface BookingContextType {
  booking: BookingState
  adminAuth: AdminAuth
  hydrated: boolean
  reservations: Reservation[]
  payments: Payment[]
  users: User[]
  setSearchParams: (params: SearchParams) => void
  addSelectedRoom: (room: Room) => void
  removeSelectedRoom: (roomId: string) => void
  clearSelectedRooms: () => void
  setSelectedServices: (services: SelectedService[]) => void
  setGuestInfo: (info: GuestInfo) => void
  createReservation: (payment: { method: "card" | "pse" | "cash" }) => string
  updateReservationStatus: (id: string, status: Reservation["status"]) => void
  updateReservation: (id: string, data: Partial<Reservation>) => void

  //IMPLEMENTANDO CON BACKEND
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>

  addRoom: (room: Room) => void
  updateRoom: (id: string, data: Partial<Room>) => void
  addService: (service: Service) => void
  updateService: (id: string, data: Partial<Service>) => void
  addUser: (user: User) => void
  resetBooking: () => void
}





const BookingContext = createContext<BookingContextType | null>(null)

const STORAGE_KEYS = {
  rooms: "hotel_rooms",
  services: "hotel_services",
  reservations: "hotel_reservations",
  payments: "hotel_payments",
  users: "hotel_users",
  adminAuth: "hotel_admin_auth",
  booking: "hotel_booking",
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {}
}

function normalizeBooking(raw: any): BookingState {
  const base: BookingState = {
    searchParams: null,
    selectedRooms: [],
    selectedServices: [],
    guestInfo: null,
  }

  if (!raw || typeof raw !== "object") return base

  // Migración: si existía selectedRoom (viejo), conviértelo a selectedRooms
  const migratedSelectedRooms = Array.isArray(raw.selectedRooms)
    ? raw.selectedRooms
    : raw.selectedRoom
      ? [raw.selectedRoom]
      : []

  return {
    searchParams: raw.searchParams ?? null,
    selectedRooms: migratedSelectedRooms,
    selectedServices: Array.isArray(raw.selectedServices) ? raw.selectedServices : [],
    guestInfo: raw.guestInfo ?? null,
  }
}

const defaultBooking: BookingState = {
  searchParams: null,
  selectedRooms: [],
  selectedServices: [],
  guestInfo: null,
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [rooms, setRooms] = useState<BackendRoom[]>([])
  const [services, setServices] = useState<BackendService[]>([])
  const [reservations, setReservations] = useState<Reservation[]>(mockReservations)
  const [payments, setPayments] = useState<Payment[]>([])
  const [users, setUsers] = useState<User[]>(defaultUsers)
  const [booking, setBooking] = useState<BookingState>(defaultBooking)
  const [adminAuth, setAdminAuth] = useState<AdminAuth>(() =>
  loadFromStorage(STORAGE_KEYS.adminAuth, { isAuthenticated: false, user: null })
    )
  const [hydrated, setHydrated] = useState(false)


  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    try {
      await loginService(email, password)

      // Forzamos refresh para obtener token con role (si el backend lo entrega ahí)
    await refreshService()

      // leer role del access token
      const access = authStorage.getAccess()
      const payload = access ? decodeJwt(access) : null
  
      const role = payload?.role as Role | undefined
      if (!role) throw new Error("No se pudo obtener el rol del token")

  
    setAdminAuth({
      isAuthenticated: true,
      user: {
        id: payload?.sub || "me",
        name: email, // temporal (hasta tener /me)
        email,
        phone: "",
        password: "",
        role,
      } as any,
    })
  
    return true
  } catch (e) {
    console.error("LOGIN ERROR:", e)
    return false
  }
}, [])

  
  //logout
  const logout = useCallback(async () => {
    try {
      await logoutService()
    } finally {
      setAdminAuth({ isAuthenticated: false, user: null })
    }
  }, [])

  useEffect(() => {
    setRooms(loadFromStorage(STORAGE_KEYS.rooms, defaultRooms))
    setServices(loadFromStorage(STORAGE_KEYS.services, defaultServices))
    setReservations(loadFromStorage(STORAGE_KEYS.reservations, mockReservations))
    setPayments(loadFromStorage(STORAGE_KEYS.payments, []))
    setUsers(loadFromStorage(STORAGE_KEYS.users, defaultUsers))
    const stored = loadFromStorage(STORAGE_KEYS.booking, defaultBooking)
    setBooking(normalizeBooking(stored))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveToStorage(STORAGE_KEYS.rooms, rooms)
  }, [rooms, hydrated])

  useEffect(() => {
    if (!hydrated) return
    saveToStorage(STORAGE_KEYS.services, services)
  }, [services, hydrated])

  useEffect(() => {
    if (!hydrated) return
    saveToStorage(STORAGE_KEYS.reservations, reservations)
  }, [reservations, hydrated])

  useEffect(() => {
    if (!hydrated) return
    saveToStorage(STORAGE_KEYS.payments, payments)
  }, [payments, hydrated])

  useEffect(() => {
    if (!hydrated) return
    saveToStorage(STORAGE_KEYS.users, users)
  }, [users, hydrated])

  useEffect(() => {
    if (!hydrated) return
    saveToStorage(STORAGE_KEYS.booking, booking)
  }, [booking, hydrated])

  useEffect(() => {
    if (!hydrated) return
    saveToStorage(STORAGE_KEYS.adminAuth, adminAuth)
  }, [adminAuth, hydrated])

  const setSearchParams = useCallback((params: SearchParams) => {
    setBooking((prev) => ({ ...prev, searchParams: params }))
  }, [])

  const addSelectedRoom = useCallback((room: Room) => {
    setBooking((prev) => {
      const list = Array.isArray(prev.selectedRooms) ? prev.selectedRooms : []
      const exists = list.some((r) => r.id === room.id)
      if (exists) return prev
      return { ...prev, selectedRooms: [...list, room] }
    })
  }, [])
  
  const removeSelectedRoom = useCallback((roomId: string) => {
    setBooking((prev) => ({
      ...prev,
      selectedRooms: prev.selectedRooms.filter((r) => r.id !== roomId),
    }))
  }, [])

  const clearSelectedRooms = useCallback(() => {
    setBooking((prev) => ({ ...prev, selectedRooms: [] }))
  }, [])

  const setSelectedServices = useCallback((svc: SelectedService[]) => {
    setBooking((prev) => ({ ...prev, selectedServices: svc }))
  }, [])

  const setGuestInfo = useCallback((info: GuestInfo) => {
    setBooking((prev) => ({ ...prev, guestInfo: info }))
  }, [])

  const createReservation = useCallback(
  (payment: { method: "card" | "pse" | "cash" }): string => {
    const resId = `res-${Date.now()}`
    const payId = `pay-${Date.now()}`

    const sp = booking.searchParams
    if (!sp) throw new Error("Faltan searchParams para crear reserva")
    if (!booking.guestInfo) throw new Error("Falta guestInfo para crear reserva")
    if (!booking.selectedRooms || booking.selectedRooms.length === 0) {
      throw new Error("Debes seleccionar al menos una habitación")
    }

    const svcTotal = booking.selectedServices.reduce((sum, s) => {
      const svc = services.find((sv) => sv.id === s.serviceId)
      return sum + (svc ? svc.price * s.amount : 0)
    }, 0)

    const start = new Date(sp.startDate)
    const end = new Date(sp.endDate)
    const nights = Math.max(
      1,
      Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    )

    // suma de precios por noche de TODAS las habitaciones seleccionadas
    const roomsPerNightTotal = booking.selectedRooms.reduce((sum, r) => sum + (r.price ?? 0), 0)
    const total = roomsPerNightTotal * nights + svcTotal

    // ideal: guardar roomIds (varias habitaciones)
    const newReservation: Reservation = {
      id: resId,
      // @ts-expect-error si tu tipo aún tiene roomId, cambia Reservation para usar roomIds
      roomIds: booking.selectedRooms.map((r) => r.id),
      guestInfo: booking.guestInfo,
      startDate: sp.startDate,
      endDate: sp.endDate,
      adults: sp.adults,
      kids: sp.kids,
      babies: sp.babies,
      pets: sp.pets,
      services: booking.selectedServices,
      totalPrice: total,
      status: "PAID_PENDING_APPROVAL",
      createdAt: new Date().toISOString().split("T")[0],
    }

    const newPayment: Payment = {
      id: payId,
      reservationId: resId,
      amount: total,
      method: payment.method,
      status: "paid",
      createdAt: new Date().toISOString().split("T")[0],
    }

    setReservations((prev) => [...prev, newReservation])
    setPayments((prev) => [...prev, newPayment])
    return resId
  },
  [booking, services],
)

  const updateReservationStatus = useCallback((id: string, status: Reservation["status"]) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
  }, [])

  const updateReservation = useCallback((id: string, data: Partial<Reservation>) => {
    setReservations((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }, [])


  const addRoom = useCallback((room: Room) => {
    setRooms((prev) => [...prev, room])
  }, [])

  const updateRoom = useCallback((id: string, data: Partial<Room>) => {
    setRooms((prev) => prev.map((r) => (r.id === id ? { ...r, ...data } : r)))
  }, [])

  const addService = useCallback((service: Service) => {
    setServices((prev) => [...prev, service])
  }, [])

  const updateService = useCallback((id: string, data: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)))
  }, [])

  const addUser = useCallback((user: User) => {
    setUsers((prev) => [...prev, user])
  }, [])

  const resetBooking = useCallback(() => {
    setBooking(defaultBooking)
  }, [])

  return (
    <BookingContext.Provider
      value={{
        booking,
        adminAuth,
        rooms,
        hydrated,
        services,
        reservations,
        payments,
        users,
        setSearchParams,
        addSelectedRoom,
        removeSelectedRoom,
        clearSelectedRooms,
        setSelectedServices,
        setGuestInfo,
        createReservation,
        updateReservationStatus,
        updateReservation,
        login,
        logout,
        addUser,
        resetBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error("useBooking must be used within BookingProvider")
  return ctx
}
