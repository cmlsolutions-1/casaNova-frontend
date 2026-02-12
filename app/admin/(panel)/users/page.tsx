// app/admin/(panel)/users/page.tsx
"use client"

import React, { useEffect, useMemo, useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { listUsersService, createUserService, type BackendUser } from "@/services/user.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

import { Plus, UserCircle, Shield, ShieldCheck } from "lucide-react"

export default function AdminUsersPage() {
  const { adminAuth } = useBooking()

  const role = adminAuth.user?.role
  const isSuperAdmin = role === "SUPER_ADMIN"

  const [creating, setCreating] = useState(false)
  const [users, setUsers] = useState<BackendUser[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadUsers = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listUsersService()
      setUsers(data)
    } catch (e: any) {
      setError(e?.message ?? "Error cargando usuarios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminAuth.isAuthenticated) return
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAuth.isAuthenticated])

  if (!isSuperAdmin) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No tienes acceso a esta sección.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>

        <Dialog open={creating} onOpenChange={setCreating}>
          <DialogTrigger asChild>
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Empleado
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-serif text-foreground">Crear Empleado</DialogTitle>
            </DialogHeader>

            <CreateUserForm
              onSave={async (body) => {
                await createUserService(body)
                await loadUsers()
                setCreating(false)
              }}
              onClose={() => setCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {loading && <p className="text-muted-foreground">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {users.map((user) => (
          <Card key={user.id} className="border-border">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                  <UserCircle className="h-6 w-6 text-muted-foreground" />
                </div>

                <div className="flex-1 space-y-1">
                  <h3 className="font-semibold text-foreground">{user.name}</h3>
                  <p className="text-sm text-muted-foreground">{user.email}</p>

                  <Badge
                    variant={
                      user.role === "SUPER_ADMIN"
                        ? "default"
                        : user.role === "ADMIN"
                        ? "secondary"
                        : "outline"
                    }
                    className="mt-1"
                  >
                    {user.role === "SUPER_ADMIN" && (
                      <>
                        <ShieldCheck className="mr-1 h-3 w-3" />
                        Super Admin
                      </>
                    )}
                    {user.role === "ADMIN" && (
                      <>
                        <Shield className="mr-1 h-3 w-3" />
                        Admin
                      </>
                    )}
                    {user.role === "EMPLOYEE" && (
                      <>
                        <UserCircle className="mr-1 h-3 w-3" />
                        Empleado
                      </>
                    )}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CreateUserForm({
  onSave,
  onClose,
}: {
  onSave: (body: { name: string; email: string; phone: string; password: string; role: "EMPLOYEE" }) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      await onSave({ name, email, phone, password, role: "EMPLOYEE" })
    } catch (e: any) {
      setError(e?.message ?? "Error creando usuario")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <Label className="text-foreground">Nombre</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Correo electrónico</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Teléfono</Label>
        <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label className="text-foreground">Contraseña</Label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={4}
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90" disabled={saving}>
          {saving ? "Creando..." : "Crear empleado"}
        </Button>
      </div>
    </form>
  )
}
