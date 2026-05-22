import { formatCurrency } from "@/lib/utils"
import type { ProveedorRow } from "@/types"

export function ProveedorTable({ proveedores }: { proveedores: ProveedorRow[] }) {
  if (proveedores.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#64748B]">
        No hay proveedores. Se añaden automáticamente al procesar facturas.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-[#E2E8F0]">
      <table className="w-full text-sm">
        <thead className="bg-[#F8FAFC] text-[#64748B]">
          <tr>
            <th className="px-4 py-3 text-left font-medium">CIF</th>
            <th className="px-4 py-3 text-left font-medium">Nombre</th>
            <th className="px-4 py-3 text-right font-medium">Nº Facturas</th>
            <th className="px-4 py-3 text-right font-medium">Total acumulado</th>
            <th className="px-4 py-3 text-right font-medium">Media por factura</th>
          </tr>
        </thead>
        <tbody>
          {proveedores.map((p, i) => {
            const media = p.totalFacturas > 0 ? Number(p.totalImporte) / p.totalFacturas : 0
            return (
              <tr
                key={p.id}
                className={`border-t border-[#E2E8F0] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#F8FAFC]/50" : ""}`}
              >
                <td className="px-4 py-3 font-mono text-xs">{p.cif}</td>
                <td className="px-4 py-3 font-medium">{p.nombre}</td>
                <td className="px-4 py-3 text-right tabular-nums">{p.totalFacturas}</td>
                <td className="px-4 py-3 text-right tabular-nums font-semibold">
                  {formatCurrency(p.totalImporte)}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-[#64748B]">
                  {formatCurrency(media)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
