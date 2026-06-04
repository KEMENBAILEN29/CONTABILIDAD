"use client"

import { FileText, Building2, Receipt } from "lucide-react"
import { Button } from "@/components/ui/button"
import { formatCurrency, formatDate, formatCIF } from "@/lib/utils"
import type { FacturaConLineas, TipoFactura } from "@/types"

interface FacturaEscanResultProps {
  factura: FacturaConLineas
  onGuardar: () => void
  onEscanearOtra: () => void
}

function BadgeTipo({ tipo }: { tipo: TipoFactura | null }) {
  if (!tipo) return null
  const styles: Record<TipoFactura, string> = {
    INGRESO: "bg-green-100 text-[#16A34A] border border-green-200",
    GASTO: "bg-red-100 text-[#DC2626] border border-red-200",
    AMBAS: "bg-gray-100 text-[#64748B] border border-gray-200",
  }
  const labels: Record<TipoFactura, string> = {
    INGRESO: "Ingreso",
    GASTO: "Gasto",
    AMBAS: "Ingreso y Gasto",
  }
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[tipo]}`}>
      {labels[tipo]}
    </span>
  )
}

export function FacturaEscanResult({ factura, onGuardar, onEscanearOtra }: FacturaEscanResultProps) {
  return (
    <div className="space-y-4">
      {/* Cabecera */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]">
              <FileText className="h-5 w-5 text-[#2563EB]" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0F172A]">{factura.archivoNombre}</p>
              <p className="text-xs text-[#64748B]">
                {factura.numeroFactura ? `Nº ${factura.numeroFactura}` : "Sin número"}{" "}
                {factura.fechaFactura ? `· ${formatDate(factura.fechaFactura)}` : ""}
              </p>
            </div>
          </div>
          <BadgeTipo tipo={factura.tipo} />
        </div>
      </div>

      {/* Emisor y Receptor */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-[#64748B]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Emisor</p>
          </div>
          <p className="text-sm font-medium text-[#0F172A]">{factura.emisorNombre ?? "—"}</p>
          <p className="text-xs text-[#64748B] mt-1">CIF: {formatCIF(factura.emisorCif)}</p>
        </div>
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-[#64748B]" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">Receptor</p>
          </div>
          <p className="text-sm font-medium text-[#0F172A]">{factura.receptorNombre ?? "—"}</p>
          <p className="text-xs text-[#64748B] mt-1">CIF: {formatCIF(factura.receptorCif)}</p>
        </div>
      </div>

      {/* Concepto */}
      {factura.concepto && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-2">Concepto</p>
          <p className="text-sm text-[#0F172A]">{factura.concepto}</p>
        </div>
      )}

      {/* Líneas de detalle */}
      {factura.lineas.length > 0 && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white overflow-hidden">
          <div className="px-5 py-4 border-b border-[#E2E8F0]">
            <div className="flex items-center gap-2">
              <Receipt className="h-4 w-4 text-[#64748B]" />
              <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                Líneas de detalle
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0]">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-medium text-[#64748B]">Descripción</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#64748B]">Cant.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#64748B]">P. Unit.</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-[#64748B]">IVA%</th>
                  <th className="px-5 py-3 text-right text-xs font-medium text-[#64748B]">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {factura.lineas.map((linea) => (
                  <tr key={linea.id} className="hover:bg-[#F8FAFC]">
                    <td className="px-5 py-3 text-[#0F172A]">{linea.descripcion}</td>
                    <td className="px-4 py-3 text-right text-[#64748B]">{Number(linea.cantidad)}</td>
                    <td className="px-4 py-3 text-right text-[#64748B]">{formatCurrency(linea.precioUnitario)}</td>
                    <td className="px-4 py-3 text-right text-[#64748B]">{Number(linea.ivaPorcentaje)}%</td>
                    <td className="px-5 py-3 text-right font-medium text-[#0F172A]">{formatCurrency(linea.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Resumen financiero */}
      <div className="rounded-lg border border-[#E2E8F0] bg-white p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#64748B] mb-4">Resumen</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">Base imponible</span>
            <span className="text-[#0F172A]">{formatCurrency(factura.baseImponible)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-[#64748B]">
              IVA {factura.ivaPorcentaje ? `(${Number(factura.ivaPorcentaje)}%)` : ""}
            </span>
            <span className="text-[#0F172A]">{formatCurrency(factura.ivaImporte)}</span>
          </div>
          <div className="mt-3 pt-3 border-t border-[#E2E8F0] flex justify-between items-center">
            <span className="text-sm font-semibold text-[#0F172A]">Total</span>
            <span className="text-3xl font-bold text-[#0F172A]">{formatCurrency(factura.total)}</span>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="flex gap-3 pt-2">
        <Button onClick={onGuardar} className="bg-[#2563EB] hover:bg-blue-700">
          Guardar en facturas
        </Button>
        <Button variant="outline" onClick={onEscanearOtra}>
          Escanear otra
        </Button>
      </div>
    </div>
  )
}
