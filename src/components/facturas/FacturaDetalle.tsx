"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EstadoBadge } from "./EstadoBadge"
import { formatCurrency, formatDate } from "@/lib/utils"
import type { FacturaConLineas } from "@/types"

interface FacturaDetalleProps {
  factura: FacturaConLineas
}

export function FacturaDetalle({ factura }: FacturaDetalleProps) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    numeroFactura: factura.numeroFactura ?? "",
    emisorCif: factura.emisorCif ?? "",
    emisorNombre: factura.emisorNombre ?? "",
    receptorCif: factura.receptorCif ?? "",
    receptorNombre: factura.receptorNombre ?? "",
    baseImponible: factura.baseImponible ?? "",
    ivaPorcentaje: factura.ivaPorcentaje ?? "",
    ivaImporte: factura.ivaImporte ?? "",
    total: factura.total ?? "",
    concepto: factura.concepto ?? "",
  })

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/facturas/${factura.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error("Error al guardar")
      setEditing(false)
      router.refresh()
    } catch {
      alert("Error al guardar los cambios")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("¿Eliminar esta factura? Esta acción no se puede deshacer.")) return
    const res = await fetch(`/api/facturas/${factura.id}`, { method: "DELETE" })
    if (res.ok) router.push("/facturas")
  }

  const field = (label: string, key: keyof typeof form) => (
    <div>
      <Label>{label}</Label>
      {editing ? (
        <Input
          className="mt-1"
          value={String(form[key])}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
        />
      ) : (
        <p className="mt-1 text-sm text-[#0F172A]">{String(form[key]) || "—"}</p>
      )}
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold">{factura.archivoNombre}</h2>
          <EstadoBadge estado={factura.estado} />
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button onClick={handleSave} disabled={saving} size="sm">
                {saving ? "Guardando..." : "Guardar"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
                Editar
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDelete}>
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      {factura.errorMensaje && (
        <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-[#DC2626]">
          Error: {factura.errorMensaje}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 rounded-lg border border-[#E2E8F0] bg-white p-6">
        <div className="col-span-2 text-sm font-semibold text-[#64748B] uppercase tracking-wider mb-2">
          Datos de la factura
        </div>
        {field("Número de factura", "numeroFactura")}
        <div>
          <Label>Fecha</Label>
          <p className="mt-1 text-sm">{formatDate(factura.fechaFactura)}</p>
        </div>
        {field("CIF Emisor", "emisorCif")}
        {field("Nombre Emisor", "emisorNombre")}
        {field("CIF Receptor", "receptorCif")}
        {field("Nombre Receptor", "receptorNombre")}
        {field("Concepto", "concepto")}
        <div />
        {field("Base Imponible", "baseImponible")}
        {field("IVA %", "ivaPorcentaje")}
        {field("Importe IVA", "ivaImporte")}
        {field("Total", "total")}
      </div>

      {factura.lineas.length > 0 && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0]">
            <h3 className="text-sm font-semibold text-[#0F172A]">Líneas de detalle</h3>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#F8FAFC] text-[#64748B]">
              <tr>
                <th className="px-4 py-2 text-left font-medium">Descripción</th>
                <th className="px-4 py-2 text-right font-medium">Cant.</th>
                <th className="px-4 py-2 text-right font-medium">P. Unit.</th>
                <th className="px-4 py-2 text-right font-medium">IVA %</th>
                <th className="px-4 py-2 text-right font-medium">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {factura.lineas.map((l) => (
                <tr key={l.id} className="border-t border-[#E2E8F0]">
                  <td className="px-4 py-2">{l.descripcion}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{l.cantidad}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{formatCurrency(l.precioUnitario)}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{l.ivaPorcentaje}%</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">{formatCurrency(l.subtotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
