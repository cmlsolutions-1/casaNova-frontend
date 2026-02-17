// lib/rbac.ts
export type Role = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE"

export const ROLE_LABEL: Record<Role, string> = {
  SUPER_ADMIN: "Super Administrador",
  ADMIN: "Administrador",
  EMPLOYEE: "Empleado",
}

export const PERMISSIONS: {
  routes: Record<Role, string[]>
  actions: Record<Role, string[]>
} = {
  routes: {
    SUPER_ADMIN: ["/admin", "/admin/rooms", "/admin/services", "/admin/amenities", "/admin/reservations", "/admin/users"],
    ADMIN: ["/admin", "/admin/rooms", "/admin/services", "/admin/amenities","/admin/reservations"],
    EMPLOYEE: ["/admin", "/admin/rooms", "/admin/reservations"],
  },
  actions: {
    SUPER_ADMIN: ["CREATE_USER", "EDIT_USER", "DELETE_USER"],
    ADMIN: [],
    EMPLOYEE: [],
  },
}

export function canAccessRoute(role: Role, href: string) {
  return PERMISSIONS.routes[role].includes(href)
}

export function canDo(role: Role, action: string) {
  return PERMISSIONS.actions[role].includes(action)
}
