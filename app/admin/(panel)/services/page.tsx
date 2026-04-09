// app/admin/(panel)/services/page.tsx
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
import { formatCurrencyCOP } from "@/utils/format"
import { DialogDescription } from "@/components/ui/dialog"

function normalizeService(s: any): BackendService {
  return {
    ...s,
    description: s.description ?? s.decription ?? "",
    type: s.type ?? "STAY",
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
    <div className="flex h-full w-full items-center justify-center bg-muted text-xs text-muted-foreground">
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
  const [type, setType] = useState<"STAY" | "DAY_PASS">(service?.type ?? "STAY")

  const [images, setImages] = useState<LocalImage[]>([])
  const [uploadedImageIds, setUploadedImageIds] = useState<string[]>([])

  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const hasExistingImages = (service?.images?.length ?? 0) > 0
  const hasUploadedIds = uploadedImageIds.length > 0

  const MAX_SERVICE_IMAGES = 10

    function moveItemToFront<T extends { id: string }>(items: T[], id: string): T[] {
      const index = items.findIndex((item) => item.id === id)
      if (index <= 0) return items

      const selected = items[index]
      return [selected, ...items.filter((_, i) => i !== index)]
    }

    function moveArrayIndexToFront<T>(items: T[], index: number): T[] {
      if (index <= 0 || index >= items.length) return items
      const selected = items[index]
      return [selected, ...items.filter((_, i) => i !== index)]
    }

  const [existingImages, setExistingImages] = useState(service?.images ?? [])

  const canSubmit = useMemo(() => {
    if (!isEdit) return hasUploadedIds
    return hasUploadedIds || hasExistingImages
  }, [isEdit, hasUploadedIds, hasExistingImages])

  useEffect(() => {
    setName(service?.name ?? "")
    setDescription(service?.description ?? service?.decription ?? "")
    setPrice(service?.price ?? 50)
    setBillingType(service?.billingType ?? "FIXED")
    setType(service?.type ?? "STAY")

    images.forEach((img) => URL.revokeObjectURL(img.preview))
    setImages([])
    setUploadedImageIds([])

    setError(null)
    setUploading(false)
    setSaving(false)
    setExistingImages(service?.images ?? [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [service?.id])

  const formatCOPNumber = (value: number | string) => {
    const numeric =
      typeof value === "number"
        ? value
        : Number(String(value).replace(/\D/g, ""))

    if (!numeric) return ""
    return new Intl.NumberFormat("es-CO").format(numeric)
  }

  const handlePickFiles = (files: FileList | null) => {
    if (!files) return

    const availableSlots = MAX_SERVICE_IMAGES - images.length

    if (availableSlots <= 0) {
      setError(`Solo puedes cargar máximo ${MAX_SERVICE_IMAGES} imágenes.`)
      return
    }

    const validImages = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    )

    const filesToAdd = validImages.slice(0, availableSlots)

    if (filesToAdd.length < validImages.length) {
      setError(`Solo puedes cargar máximo ${MAX_SERVICE_IMAGES} imágenes.`)
    } else {
      setError(null)
    }

    const next: LocalImage[] = filesToAdd.map((file) => ({
      id: Math.random().toString(36).slice(2),
      file,
      preview: URL.createObjectURL(file),
    }))

    if (next.length === 0) return

    setUploadedImageIds([])
    setImages((prev) => [...prev, ...next])
  }

  const makeLocalImageCover = (id: string) => {
    const index = images.findIndex((img) => img.id === id)
    if (index <= 0) return

    setImages((prev) => moveItemToFront(prev, id))

    if (uploadedImageIds.length === images.length) {
      setUploadedImageIds((prev) => moveArrayIndexToFront(prev, index))
    } else {
      setUploadedImageIds([])
    }
  }

  const makeExistingImageCover = (id: string) => {
    setExistingImages((prev) => {
      const next = moveItemToFront(prev, id)
      console.log("existingImages reordered:", next.map((img) => img.id))
      return next
    })
  }

  const removeLocalImage = (id: string) => {
    setImages((prev) => {
      const target = prev.find((x) => x.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((x) => x.id !== id)
    })
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

    const existingImageIds = existingImages.map((img) => img.id)

    const imagesIdsToSend = isEdit
      ? uploadedImageIds.length > 0
        ? uploadedImageIds
        : existingImageIds
      : uploadedImageIds

    const body: ServiceUpsertBody = {
      name,
      description,
      price,
      billingType,
      type,
      imagesIds: imagesIdsToSend,
    }

    console.log("existingImageIds:", existingImageIds)
    console.log("uploadedImageIds al hacer submit:", uploadedImageIds)
    console.log("imagesIdsToSend:", imagesIdsToSend)
    console.log("BODY QUE SE ENVÍA:", body)

    console.log("imagesIdsToSend (ORDEN):", imagesIdsToSend)

    await onSave(body)
    onClose()
  } catch (e: any) {
    setError(e?.message ?? "Error guardando servicio")
  } finally {
    setSaving(false)
  }
}

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
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
        <Label>Tipo de servicio</Label>
        <Select value={type} onValueChange={(v) => setType(v as "STAY" | "DAY_PASS")}>
          <SelectTrigger>
            <SelectValue placeholder="Selecciona..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="STAY">ALOJAMIENTO</SelectItem>
            <SelectItem value="DAY_PASS">PASADÍA O SALÓN</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Precio (COP)</Label>
        <Input
          type="text"
          inputMode="numeric"
          value={formatCOPNumber(price)}
          onChange={(e) => {
            const raw = e.target.value.replace(/\D/g, "")
            setPrice(raw ? Number(raw) : 0)
          }}
          placeholder="100.000"
          required
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label>Imágenes</Label>
          <span className="text-xs text-muted-foreground">
            Máximo {MAX_SERVICE_IMAGES} imágenes. La primera será la portada.
          </span>
        </div>

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
            Seleccionadas: {images.length}/{MAX_SERVICE_IMAGES}
          </Badge>

          <Badge variant="outline" className="text-xs">
            {uploadedImageIds.length > 0
              ? `Subidas: ${uploadedImageIds.length}`
              : "Aún no subidas"}
          </Badge>
        </div>

        {isEdit && uploadedImageIds.length === 0 && hasExistingImages && (
          <p className="text-xs text-muted-foreground">
            Si no subes nuevas imágenes, se conservarán las actuales. También puedes elegir cuál será la portada.
          </p>
        )}

        {images.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Nuevas imágenes ({images.length}). La primera será la portada.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {images.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <img
                    src={img.preview}
                    alt={img.file.name}
                    className="h-full w-full object-cover"
                  />

                  {index === 0 && (
                    <Badge className="absolute left-2 top-2 border border-yellow-300 bg-yellow-100 text-yellow-800">
                      Portada actual
                    </Badge>
                  )}

                  <div className="absolute right-2 top-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => makeLocalImageCover(img.id)}
                      className="rounded-md bg-black/70 px-2 py-1 text-[10px] text-white transition hover:bg-black"
                    >
                      Portada
                    </button>

                    <button
                      type="button"
                      onClick={() => removeLocalImage(img.id)}
                      className="rounded-full bg-destructive p-1.5 text-destructive-foreground opacity-100 transition-opacity sm:opacity-0 group-hover:opacity-100"
                      aria-label="Eliminar imagen"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                    <p className="truncate text-xs text-white">{img.file.name}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Si eliges una portada después de subir, vuelve a subir las imágenes para conservar el orden.
            </p>
          </div>
        )}

        {existingImages.length > 0 && images.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              Imágenes actuales ({existingImages.length}). La primera es la portada actual.
            </p>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {existingImages.map((img, index) => (
                <div
                  key={img.id}
                  className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
                >
                  <img
                    src={img.url}
                    alt="Servicio"
                    className="h-full w-full object-cover"
                  />

                  {index === 0 && (
                    <Badge className="absolute left-2 top-2 border border-yellow-300 bg-yellow-100 text-yellow-800">
                      Portada
                    </Badge>
                  )}

                  {index !== 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          console.log("CLICK PORTADA EXISTENTE:", img.id)
                          makeExistingImageCover(img.id)
                        }}
                        className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-[10px] text-white transition hover:bg-black"
                      >
                        Portada
                      </button>
                    )}
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Si quieres reemplazarlas, selecciona nuevas imágenes, ordénalas y vuelve a subir.
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

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Crear servicio</DialogTitle>
                  <DialogDescription>
                    Agrega la información del servicio, sus imágenes y elige cuál será la portada.
                  </DialogDescription>
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {services.map((svc) => {
          const isActive = svc.status === "ACTIVE"
          const img = svc.images?.[0]?.url

          return (
            <Card key={svc.id} className="overflow-hidden border-border">
              <div className="relative h-36 bg-muted">
                {img ? (
                  <img src={img} alt={svc.name} className="h-full w-full object-cover" />
                ) : (
                  <ImagePlaceholder />
                )}

                <Badge
                  className={`absolute right-2 top-2 ${
                    isActive
                      ? "border border-green-300 bg-green-100 text-green-700"
                      : "border border-red-300 bg-red-100 text-red-700"
                  }`}
                >
                  {isActive ? "Activo" : "Inactivo"}
                </Badge>
              </div>

              <CardContent className="space-y-2 p-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="text-xs">
                    {svc.billingType === "HOURLY" ? "Por hora" : "Fijo"}
                  </Badge>

                  <Badge variant="secondary" className="text-xs">
                    {svc.type === "STAY" ? "Alojamiento" : "Pasadía / Salón"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{svc.name}</h3>
                  <span className="whitespace-nowrap font-bold text-accent">
                    {formatCurrencyCOP(svc.price)}
                  </span>
                </div>

                <p className="line-clamp-2 text-xs text-muted-foreground">{svc.description}</p>

                {canManage && (
                  <div className="mt-3 flex flex-wrap justify-center gap-2">
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

      <Dialog open={!!editingService} onOpenChange={(open) => !open && setEditingService(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar servicio</DialogTitle>
              <DialogDescription>
                Actualiza la información del servicio y define la imagen de portada.
              </DialogDescription>
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