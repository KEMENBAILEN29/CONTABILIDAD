import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

interface ClienteRow {
  id: string
  cif: string
  nombre: string
  email: string | null
  activo: boolean
  createdAt: Date
  _count: { facturas: number }
}

export function ClienteTable({ clientes }: { clientes: ClienteRow[] }) {
  if (clientes.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-[#64748B]">
        No hay clientes. Crea el primero usando el botón de arriba.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-md border border-[#E2E8F0]">
      <table className="w-full text-sm">
        <thead className="bg-[#F8FAFC] text-[#64748B]">
          <tr>
            <th className="px-4 py-3 text-left font-medium">CIF</th>
            <th className="px-4 py-3 text-left font-medium">Razón social</th>
            <th className="px-4 py-3 text-left font-medium">Email</th>
            <th className="px-4 py-3 text-center font-medium">Facturas</th>
            <th className="px-4 py-3 text-center font-medium">Estado</th>
            <th className="px-4 py-3 text-left font-medium">Alta</th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map((c, i) => (
            <tr
              key={c.id}
              className={`border-t border-[#E2E8F0] hover:bg-[#F8FAFC] ${i % 2 === 1 ? "bg-[#F8FAFC]/50" : ""}`}
            >
              <td className="px-4 py-3 font-mono text-xs">{c.cif}</td>
              <td className="px-4 py-3 font-medium">{c.nombre}</td>
              <td className="px-4 py-3 text-[#64748B]">{c.email ?? "—"}</td>
              <td className="px-4 py-3 text-center tabular-nums">{c._count.facturas}</td>
              <td className="px-4 py-3 text-center">
                <Badge variant={c.activo ? "success" : "secondary"}>
                  {c.activo ? "Activo" : "Inactivo"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-[#64748B]">{formatDate(c.createdAt)}</td>
              <td className="px-4 py-3 text-right">
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/admin/clientes/${c.cif}`}>Ver</Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm">
                    <Link href={`/admin/clientes/${c.cif}/editar`}>Editar</Link>
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
