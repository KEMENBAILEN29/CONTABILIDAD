"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const CIF_REGEX = /^[A-Z][0-9]{7}[A-Z0-9]$/i

interface FormData {
  cif: string
  nombre: string
  email: string
  telefono: string
  direccion: string
  password: string
  passwordConfirm: string
}

const initial: FormData = { cif: "", nombre: "", email: "", telefono: "", direccion: "", password: "", passwordConfirm: "" }

export function NuevoClienteForm() {
  const router = useRouter()
  const [form, setForm] = useState<FormData>(initial)
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [saving, setSaving] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const set = (key: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }))

  const validate = (): boolean => {
    const e: Partial<FormData> = {}
    if (!CIF_REGEX.test(form.cif)) e.cif = "CIF inválido (ej: B12345678)"
    if (!form.nombre.trim()) e.nombre = "Obligatorio"
    if (form.password.length < 8) e.password = "Mínimo 8 caracteres"
    if (form.password !== form.passwordConfirm) e.passwordConfirm = "Las contraseñas no coinciden"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return
    setSaving(true)
    setServerError(null)
    try {
      const res = await fetch("/api/admin/empresas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cif: form.cif.toUpperCase(),
          nombre: form.nombre,
          email: form.email || undefined,
          telefono: form.telefono || undefined,
          direccion: form.direccion || undefined,
          password: form.password,
        }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) throw new Error(data.error ?? "Error al crear cliente")
      router.push("/admin/clientes")
      router.refresh()
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setSaving(false)
    }
  }

  const field = (label: string, key: keyof FormData, type = "text", placeholder?: string) => (
    <div>
      <Label htmlFor={key}>{label}</Label>
      <Input
        id={key}
        type={type}
        className="mt-1"
        placeholder={placeholder}
        value={form[key]}
        onChange={set(key)}
      />
      {errors[key] && <p className="mt-1 text-xs text-[#DC2626]">{errors[key]}</p>}
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="max-w-lg space-y-4 rounded-lg border border-[#E2E8F0] bg-white p-6">
      {field("CIF *", "cif", "text", "B12345678")}
      {field("Razón social *", "nombre", "text", "Empresa SL")}
      {field("Email de contacto", "email", "email", "empresa@ejemplo.com")}
      {field("Teléfono", "telefono", "tel", "+34 600 000 000")}
      {field("Dirección", "direccion")}
      {field("Contraseña *", "password", "password")}
      {field("Confirmar contraseña *", "passwordConfirm", "password")}

      {serverError && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-[#DC2626]">
          {serverError}
        </div>
      )}

      <div className="flex gap-3">
        <Button type="submit" disabled={saving}>
          {saving ? "Guardando..." : "Crear cliente"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
