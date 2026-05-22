import { db } from "@/lib/db/client"
import { Header } from "@/components/shared/Header"
import { Card, CardContent } from "@/components/ui/card"
import { Building2, FileText, Clock } from "lucide-react"

export default async function AdminDashboardPage() {
  const [totalClientes, totalFacturas, facturasPendientes] = await Promise.all([
    db.empresa.count({ where: { activo: true } }),
    db.factura.count(),
    db.factura.count({ where: { estado: "PROCESANDO" } }),
  ])

  const ultimasFacturas = await db.factura.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: { empresa: { select: { cif: true, nombre: true } } },
  })

  const stats = [
    { label: "Clientes activos", value: totalClientes, icon: Building2, color: "text-[#2563EB]", bg: "bg-blue-50" },
    { label: "Total facturas", value: totalFacturas, icon: FileText, color: "text-[#16A34A]", bg: "bg-green-50" },
    { label: "Procesando", value: facturasPendientes, icon: Clock, color: "text-[#D97706]", bg: "bg-amber-50" },
  ]

  return (
    <div>
      <Header title="Panel Administrador" description="Vista global de todos los clientes y facturas" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#64748B]">{s.label}</p>
                  <p className={`mt-1 text-3xl font-bold tabular-nums ${s.color}`}>{s.value}</p>
                </div>
                <div className={`rounded-lg p-3 ${s.bg}`}>
                  <s.icon className={`h-6 w-6 ${s.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="rounded-lg border border-[#E2E8F0] bg-white">
        <div className="px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-base font-semibold">Facturas recientes</h2>
        </div>
        <table className="w-full text-sm">
          <thead className="text-[#64748B] border-b border-[#E2E8F0]">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Empresa</th>
              <th className="px-6 py-3 text-left font-medium">Archivo</th>
              <th className="px-6 py-3 text-center font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {ultimasFacturas.map((f) => (
              <tr key={f.id} className="border-t border-[#E2E8F0] hover:bg-[#F8FAFC]">
                <td className="px-6 py-3">
                  <span className="font-mono text-xs text-[#64748B]">{f.empresa.cif}</span>
                  {" — "}
                  {f.empresa.nombre}
                </td>
                <td className="px-6 py-3">{f.archivoNombre}</td>
                <td className="px-6 py-3 text-center">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      f.estado === "PROCESADA"
                        ? "bg-green-100 text-[#16A34A]"
                        : f.estado === "ERROR"
                        ? "bg-red-100 text-[#DC2626]"
                        : "bg-amber-100 text-[#D97706]"
                    }`}
                  >
                    {f.estado}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
