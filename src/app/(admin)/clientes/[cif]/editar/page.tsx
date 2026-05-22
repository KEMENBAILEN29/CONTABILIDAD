"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/shared/Header"

interface EmpresaData {
  cif: string
  nombre: string
  email: string | null
  telefono: string | null
  direccion: string | null
  activo: boolean
}

export default function EditarClientePage() {
  const router = useRouter()
  const params = useParams()
  const cif = params.cif as string

  const [form, setForm] = useState({ nombre: "", email: "", telefono: "", direccion: "", password: "" })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activo, setActivo] = useState(true)

  useEffect(() => {
    fetch(`/api/admin/empresas/${cif}`)
      .then((r) => r.json())
      .then((data: EmpresaData) => {
        setForm({
          nombre: data.nombre,
          email: data.email ?? "",
          telefono: data.telefono ?? "",
          direccion: data.direccion ?? "",
          password: "",
        })
        setActivo(data.activo)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [cif])

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/empresas/${cif}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, password: form.password || undefined }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Error al guardar")
      router.push(`/admin/clientes/${cif}`)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async () => {
    const res = await fetch(`/api/admin/empresas/${cif}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ activo: !activo }),
    })
    if (res.ok) {
      setActivo((a) => !a)
    }
  }

  if (loading) return <p className="py-8 text-sm text-[#64748B]">Cargando...</p>

  return (
    <div>
      <Header title={`Editar ${cif}`} description="Modifica los datos de la empresa" />
      <form onSubmit={handleSave} className="max-w-lg space-y-4 rounded-lg border border-[#E2E8F0] bg-white p-6">
        {[
          { label: "Razón social *", key: "nombre" as const },
          { label: "Email de contacto", key: "email" as const, type: "email" },
          { label: "Teléfono", key: "telefono" as const, type: "tel" },
          { label: "Dirección", key: "direccion" as const },
          { label: "Nueva contraseña (dejar vacío para no cambiar)", key: "password" as const, type: "password" },
        ].map(({ label, key, type = "text" }) => (
          <div key={key}>
            <Label htmlFor={key}>{label}</Label>
            <Input id={key} type={type} className="mt-1" value={form[key]} onChange={set(key)} />
          </div>
        ))}

        {error && (
          <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-[#DC2626]">{error}</div>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={saving}>
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant={activo ? "destructive" : "secondary"}
            onClick={handleToggle}
            className="ml-auto"
          >
            {activo ? "Desactivar empresa" : "Activar empresa"}
          </Button>
        </div>
      </form>
    </div>
  )
}
