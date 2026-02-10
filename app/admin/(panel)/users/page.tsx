"use client"

import React from "react"

import { useState } from "react"
import { useBooking } from "@/lib/booking-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, UserCircle, Shield, ShieldCheck } from "lucide-react"
import type { User } from "@/lib/mock-data"

export default function AdminUsersPage() {
  const { users, addUser, adminAuth } = useBooking()
  const [creating, setCreating] = useState(false)
  const isEmployee = adminAuth.user?.role === "EMPLOYEE"

  if (isEmployee) {
    return (
      <div className="flex h-64 items-center justify-center">
        <p className="text-muted-foreground">No tienes acceso a esta seccion.</p>
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
              onSave={(user) => {
                addUser(user)
                setCreating(false)
              }}
              onClose={() => setCreating(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

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
                  <Badge variant={user.role === "ADMIN" ? "default" : "secondary"} className="mt-1">
                    {user.role === "ADMIN" ? (
                      <><ShieldCheck className="mr-1 h-3 w-3" />Admin</>
                    ) : (
                      <><Shield className="mr-1 h-3 w-3" />Empleado</>
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

function CreateUserForm({ onSave, onClose }: { onSave: (user: User) => void; onClose: () => void }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      id: `user-${Date.now()}`,
      name,
      email,
      password,
      role: "EMPLOYEE",
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label className="text-foreground">Nombre</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Correo electronico</Label>
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label className="text-foreground">Contrasena</Label>
        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={4} />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
        <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Crear empleado</Button>
      </div>
    </form>
  )
}
