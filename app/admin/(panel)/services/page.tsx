"use client"

import React, { useEffect, useMemo, useRef, useState } from "react"
import { useBooking } from "@/lib/booking-context"

import {
  listServicesService,
  createServiceService,
  updateServiceService,
  updateServiceStatusService,
  getServiceService,
  type BackendService,
  type ServiceBillingType,
  type ServiceUpsertBody,
} from "@/services/service.service"
import { uploadMediaService } from "@/services/media.service"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Plus, Pencil, Upload, X, Loader2 } from "lucide-react"

function normalizeService(s: any): BackendService {
  return {
    ...s,
    description: s.description ?? s.decription ?? "",
    images: Array.isArray(s.images) ? s.images : [],
  }
}

type LocalImage = {
  id: string
  file: File
  preview: string
}

function ImagePlaceholder() {
  return (
    <div className="h-full w-full flex items-center justify-center bg-muted text-muted-foreground text-xs">
      Sin imagen
    </div>
  )
}

function ServiceForm({
  service,
  onSave,
  onClose,
}: {
  service?: BackendService
  onSave: (data: ServiceUpsertBody) => Promise<void>
  onClose: () => void
}) {
  const isEdit = !!service?.id

  const [name, setName] = useState(service?.name ?? "")
  const [description, setDescription] = useState(service?.description ?? "")
  const [price, setPrice] = useState(service?.price ?? 50)
  const [billingType, setBillingType] = useState<ServiceBillingType>(service?.billingType ?? "FIXED")

  // Imágenes seleccionadas (local preview)
  const [images, setImages] = useState<LocalImage[]>([])
  // ids generados por /api/media/uploads
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([])

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Para validar: si editas, ya hay imágenes existentes
  const hasExistingImages = (service?.images?.length ?? 0) > 0
  const hasUploadedIds = uploadedImageIds.length > 0

  // Regla: NO se puede guardar si:
  // - creando: no hay uploaded ids
  // - editando: si NO hay uploaded ids Y tampoco hay imágenes existentes
  const canSubmit = useMemo(() => {
    if (!isEdit) return hasUploadedIds
    return hasUploadedIds || hasExistingImages
  }, [isEdit, hasUploadedIds, hasExistingImages])

  // Reset al cambiar service (abrir modal editar / crear)
  useEffect(() => {
    setName(service?.name ?? "")
    setDescription(service?.description ?? service?.decription ?? "")
    setPrice(service?.price ?? 50)
    setBillingType(service?.billingType ?? "FIXED")

    // Limpia selección nueva (local)
    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])

    // Importante: cuando editas, NO tienes ids de imágenes existentes (el backend solo da urls)
    // así que arrancamos uploaded ids vacío; si quieres cambiar imágenes, subes nuevas.
    setUploadedImageIds([])

    setError(null)
    setUploading(false)
    setSaving(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id])

  const handlePickFiles = (files: FileList | null) => {
    if (!files) return
    const next: LocalImage[] = []

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return
      const id = Math.random().toString(36).slice(2)
      const preview = URL.createObjectURL(file)
      next.push({ id, file, preview })
    })

    if (next.length === 0) return

    // Si seleccionas nuevas imágenes, invalida ids anteriores
    setUploadedImageIds([])
    setImages((prev) => [...prev, ...next])
  }

  const removeLocalImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((x) => x.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((x) => x.id !== id)
    })
    // si quitas imágenes después de haber subido, lo más seguro es invalidar ids
    setUploadedImageIds([])
  }

  const uploadSelectedImages = async () => {
    setError(null)

    if (images.length === 0) {
      setError("Selecciona al menos una imagen para poder subirla.")
      return
    }

    setUploading(true)
    try {
      const upload = await uploadMediaService(images.map((img) => img.file))
      if (!upload?.ids?.length) {
        throw new Error("No se recibieron ids del backend al subir imágenes.")
      }
      setUploadedImageIds(upload.ids)
    } catch (e: any) {
      setError(e?.message ?? "Error subiendo imágenes")
      setUploadedImageIds([])
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!canSubmit) {
        throw new Error("Debes subir las imágenes antes de guardar el servicio.")
      }

      const imagesIdsToSend = uploadedImageIds

      console.log("uploadedImageIds al hacer submit:", uploadedImageIds)
      console.log("BODY QUE SE ENVÍA:", {
      name,
      description,
      price,
      billingType,
      imagesIds: imagesIdsToSend,
    })

      await onSave({
        name,
        description,
        price,
        billingType,
        imagesIds: imagesIdsToSend,
      })

      onClose()
    } catch (e: any) {
      setError(e?.message ?? "Error guardando servicio")
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500">{error}</p>}

      <div className="space-y-2">
        <Label>Nombre</Label>
        <Input value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div className="space-y-2">
        <Label>Descripción</Label>
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} required />
      </div>

      <div className="space-y-2">
        <Label>Tipo de cobro</Label>
        <Select value={billingType} onValueChange={(v) => setBillingType(v as ServiceBillingType)}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="FIXED">Fijo</SelectItem>
            <SelectItem value="HOURLY">Por hora</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Precio ($)</Label>
        <Input type="number" min={0} value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
      </div>

      {/* Imágenes */}
      <div className="space-y-2">
        <Label>Imágenes</Label>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handlePickFiles(e.target.files)}
        />

        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
            Seleccionar imágenes
          </Button>

          <Button
            type="button"
            onClick={uploadSelectedImages}
            disabled={uploading || images.length === 0}
            className="gap-2"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Subir imágenes
          </Button>

          <Badge variant="outline" className="text-xs">
            {uploadedImageIds.length > 0
              ? `Subidas: ${uploadedImageIds.length}`
              : "Aún no subidas (obligatorio)"}
          </Badge>
        </div>

        {/* Preview nuevas (local) */}
        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Seleccionadas ({images.length})</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img) => (
                <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img src={img.preview} alt={img.file.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeLocalImage(img.id)}
                    className="absolute right-2 top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    aria-label="Eliminar imagen"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="truncate text-xs text-white">{img.file.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Preview existentes (solo si editas y NO seleccionaste nuevas) */}
        {(service?.images?.length ?? 0) > 0 && images.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Imágenes actuales</p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {(service?.images ?? []).map((url, i) => (
                <div key={`${url}-${i}`} className="aspect-square overflow-hidden rounded-lg border bg-muted">
                  <img src={url} alt="Servicio" className="h-full w-full object-cover" />
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Si quieres cambiarlas, selecciona nuevas y vuelve a subir.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" type="button" onClick={onClose} disabled={saving || uploading}>
          Cancelar
        </Button>
        <Button type="submit" disabled={saving || uploading || !canSubmit}>
          {saving ? "Guardando..." : service ? "Guardar cambios" : "Crear servicio"}
        </Button>
      </div>

      {!canSubmit && (
        <p className="text-xs text-muted-foreground">
          Para {service ? "guardar" : "crear"} el servicio debes primero <b>subir</b> las imágenes.
        </p>
      )}
    </form>
  )
}

export default function AdminServicesPage() {
  const { adminAuth } = useBooking()
  const role = adminAuth.user?.role
  const canManage = role === "SUPER_ADMIN" || role === "ADMIN"

  const [services, setServices] = useState<BackendService[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [creating, setCreating] = useState(false)
  const [editingService, setEditingService] = useState<BackendService | null>(null)

  const [changingId, setChangingId] = useState<string | null>(null)

  const loadServices = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listServicesService()
      setServices((data as any[]).map(normalizeService))
    } catch (e: any) {
      setError(e?.message ?? "Error cargando servicios")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!adminAuth.isAuthenticated) return
    loadServices()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adminAuth.isAuthenticated])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold">Servicios</h1>
          <p className="text-muted-foreground">Gestiona los servicios adicionales del hotel</p>
        </div>

        {canManage && (
          <Dialog open={creating} onOpenChange={setCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo servicio
              </Button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Crear servicio</DialogTitle>
              </DialogHeader>

              <ServiceForm
                onSave={async (body) => {
                  await createServiceService(body)
                  await loadServices()
                }}
                onClose={() => setCreating(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {loading && <p>Cargando...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {/* Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => {
          const isActive = svc.status === "ACTIVE"
          const img = svc.images?.[0]

          return (
            <Card key={svc.id} className="overflow-hidden border-border">
              {/* Image */}
              <div className="relative h-36 bg-muted">
                {img ? (
                  <img src={img} alt={svc.name} className="h-full w-full object-cover" />
                ) : (
                  <ImagePlaceholder />
                )}

                <Badge
                  className={`absolute top-2 right-2 ${
                    isActive
                      ? "bg-green-100 text-green-700 border border-green-300"
                      : "bg-red-100 text-red-700 border border-red-300"
                  }`}
                >
                  {isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              {/* Content */}
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {svc.billingType === "HOURLY" ? "Por hora" : "Fijo"}
                  </Badge>
                </div>

                <div className="flex justify-between items-center">
                  <h3 className="font-semibold">{svc.name}</h3>
                  <span className="font-bold text-accent">${svc.price}</span>
                </div>

                <p className="text-xs text-muted-foreground line-clamp-2">{svc.description}</p>

                {canManage && (
                  <div className="mt-3 flex justify-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={async () => {
                        const full = await getServiceService(svc.id)
                        setEditingService(normalizeService(full))
                      }}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Editar
                    </Button>

                    <Button
                      size="sm"
                      className={
                        isActive ? "bg-red-600 text-white hover:bg-red-700" : "bg-green-600 text-white hover:bg-green-700"
                      }
                      disabled={changingId === svc.id}
                      onClick={async () => {
                        setChangingId(svc.id)
                        try {
                          await updateServiceStatusService(svc.id, isActive ? "INACTIVE" : "ACTIVE")
                          await loadServices()
                        } finally {
                          setChangingId(null)
                        }
                      }}
                    >
                      {changingId === svc.id ? "Procesando..." : isActive ? "Inactivar" : "Activar"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
          </DialogHeader>

          {editingService && (
            <ServiceForm
              service={editingService}
              onSave={async (body) => {
                await updateServiceService(editingService.id, body)
                await loadServices()
              }}
              onClose={() => setEditingService(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}