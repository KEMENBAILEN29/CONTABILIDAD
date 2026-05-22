import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EstadoBadge } from "./EstadoBadge"
import { Badge } from "@/components/ui/badge"
import type { FacturaRow } from "@/types"

interface FacturaTableProps {
  facturas: FacturaRow[]
}

export function FacturaTable({ facturas }: FacturaTableProps) {
  if (facturas.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#64748B]">
        No hay facturas. Sube la primera usando el botón de arriba.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-[#E2E8F0]">
      <table className="w-full text-sm">
        <thead className="bg-[#F8FAFC] text-[#64748B]">
          <tr>
            <th className="px-4 py-3 text-left font-medium">Archivo</th>
            <th className="px-4 py-3 text-left font-medium">Nº Factura</th>
            <th className="px-4 py-3 text-left font-medium">Fecha</th>
            <th className="px-4 py-3 text-left font-medium">Emisor</th>
            <th className="px-4 py-3 text-right font-medium">Total</th>
            <th className="px-4 py-3 text-center font-medium">Tipo</th>
            <th className="px-4 py-3 text-center font-medium">Estado</th>
          </tr>
        </thead>
        <tbody>
          {facturas.map((f, i) => (
            <tr
              key={f.id}
              className={`border-t border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors ${
                i % 2 === 1 ? "bg-[#F8FAFC]/50" : ""
              }`}
            >
              <td className="px-4 py-3">
                <Link
                  href={`/facturas/${f.id}`}
                  className="text-[#2563EB] hover:underline truncate max-w-[180px] inline-block"
                >
                  {f.archivoNombre}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-xs">{f.numeroFactura ?? "—"}</td>
              <td className="px-4 py-3">{formatDate(f.fechaFactura)}</td>
              <td className="px-4 py-3 text-[#64748B]">{f.emisorNombre ?? "—"}</td>
              <td className="px-4 py-3 text-right tabular-nums font-medium">
                {formatCurrency(f.total)}
              </td>
              <td className="px-4 py-3 text-center">
                {f.tipo ? (
                  <Badge
                    variant={
                      f.tipo === "INGRESO" ? "success" : f.tipo === "GASTO" ? "destructive" : "warning"
                    }
                  >
                    {f.tipo}
                  </Badge>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-4 py-3 text-center">
                <EstadoBadge estado={f.estado} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
