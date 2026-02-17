// app/admin/(panel)/amenities/page.tsx
"use client"

import React, { useEffect, useState } from "react"
import { useBooking } from "@/lib/booking-context"
import {
  listAmenitiesService,
  createAmenityService,
  updateAmenityService,
  updateAmenityStatusService,
  type BackendAmenity,
} from "@/services/amenity.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Pencil } from "lucide-react"

function AmenityForm({
  amenity,
  onSave,
  onClose,
}: {
  amenity?: BackendAmenity
  onSave: (data: { name: string }) => Promise<void>
  onClose: () => void
}) {
  const [name, setName] = useState(amenity?.name ?? "")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ✅ importantísimo: cuando cambie "amenity", actualiza el input
  useEffect(() => {
    setName(amenity?.name ?? "")
    setError(null)
    setSaving(false)
  }, [amenity?.id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const cleanName = name.trim()
    if (!cleanName) {
      setError("El nombre no puede estar vacío.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave({ name: cleanName })
      onClose()
    } catch (e: any) {
      setError(e?.message ?? "Error guardando amenidad")
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

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} type="button" disabled={saving}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : amenity ? "Actualizar" : "Crear"}
        </Button>
      </div>
    </form>
  )
}

export default function AdminAmenitiesPage() {
  const { adminAuth } = useBooking()

  const role = adminAuth.user?.role
  const canManage = role === "SUPER_ADMIN" || role === "ADMIN"

  const [amenities, setAmenities] = useState<BackendAmenity[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState<BackendAmenity | null>(null)
  const [changingId, setChangingId] = useState<string | null>(null)

  const loadAmenities = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listAmenitiesService()
      setAmenities(data ?? [])
    } catch (e: any) {
      setError(e?.message ?? "Error cargando amenidades")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminAuth.isAuthenticated) return
    loadAmenities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAuth.isAuthenticated])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-foreground">Amenidades</h1>
          <p className="text-muted-foreground">Gestiona las amenidades disponibles</p>
        </div>

        {canManage && (
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Plus className="mr-2 h-4 w-4" />
                Nueva Amenidad
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="font-serif text-foreground">Crear Amenidad</DialogTitle>
              </DialogHeader>
              <AmenityForm
                onSave={async (data) => {
                  await createAmenityService(data)
                  await loadAmenities()
                }}
                onClose={() => setCreating(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading && <p className="text-muted-foreground">Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {amenities.map((amenity) => {
          const isActive = amenity.status === "ACTIVE"

          return (
            <Card key={amenity.id} className="border-border">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">{amenity.name}</h3>
                  <Badge
                    className={
                      isActive
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-red-100 text-red-700 border border-red-300"
                    }
                  >
                    {isActive ? "Activa" : "Inactiva"}
                  </Badge>
                </div>

                {canManage && (
                  <div className="flex flex-wrap justify-center gap-2 mt-3">
                    <Button variant="outline" size="sm" onClick={() => setEditing(amenity)}>
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      className={
                        isActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"
                      }
                      disabled={changingId === amenity.id}
                      onClick={async () => {
                        setChangingId(amenity.id)
                        try {
                          await updateAmenityStatusService(amenity.id, isActive ? "INACTIVE" : "ACTIVE")
                          await loadAmenities()
                        } catch (e: any) {
                          setError(e?.message ?? "Error cambiando estado")
                        } finally {
                          setChangingId(null)
                        }
                      }}
                    >
                      {changingId === amenity.id ? "Procesando..." : isActive ? "Inactivar" : "Activar"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* ✅ Dialog edición correcto */}
      <Dialog open={!!editing} onOpenChange={(open) => !open && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-serif text-foreground">Editar Amenidad</DialogTitle>
          </DialogHeader>
          {editing && (
            <AmenityForm
              amenity={editing}
              onSave={async (data) => {
                await updateAmenityService(editing.id, data)
                await loadAmenities()
              }}
              onClose={() => setEditing(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
