import Link from "next/link"
import { formatCurrency, formatDate } from "@/lib/utils"
import { EstadoBadge } from "@/components/facturas/EstadoBadge"
import type { FacturaRow } from "@/types"

export function UltimasFacturas({ facturas }: { facturas: FacturaRow[] }) {
  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white">
      <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
        <h3 className="text-base font-semibold text-[#0F172A]">Últimas facturas</h3>
        <Link href="/facturas" className="text-sm text-[#2563EB] hover:underline">
          Ver todas
        </Link>
      </div>
      {facturas.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-[#64748B]">Aún no hay facturas</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="text-[#64748B] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Archivo</th>
              <th className="px-6 py-3 text-left font-medium">Fecha</th>
              <th className="px-6 py-3 text-right font-medium">Total</th>
              <th className="px-6 py-3 text-center font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {facturas.map((f) => (
              <tr key={f.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="px-6 py-3">
                  <Link href={`/facturas/${f.id}`} className="text-[#2563EB] hover:underline">
                    {f.archivoNombre}
                  </Link>
                </td>
                <td className="px-6 py-3 text-[#64748B]">{formatDate(f.fechaFactura)}</td>
                <td className="px-6 py-3 text-right tabular-nums font-medium">
                  {formatCurrency(f.total)}
                </td>
                <td className="px-6 py-3 text-center">
                  <EstadoBadge estado={f.estado} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
