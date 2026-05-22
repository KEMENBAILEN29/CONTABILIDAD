import { notFound } from "next/navigation"
import Link from "next/link"
import { getEmpresaByCif } from "@/lib/db/empresas"
import { listFacturas } from "@/lib/db/facturas"
import { getResumenDashboard, getDatosMensuales } from "@/lib/db/facturas"
import { listProveedores } from "@/lib/db/proveedores"
import { Header } from "@/components/shared/Header"
import { Button } from "@/components/ui/button"
import { ResumenCards } from "@/components/dashboard/ResumenCards"
import { GraficaMensual } from "@/components/dashboard/GraficaMensual"
import { UltimasFacturas } from "@/components/dashboard/UltimasFacturas"
import { FacturaUploader } from "@/components/facturas/FacturaUploader"
import { Edit } from "lucide-react"

interface Props {
  params: Promise<{ cif: string }>
}

export default async function AdminClientePage({ params }: Props) {
  const { cif } = await params
  const empresa = await getEmpresaByCif(cif)
  if (!empresa) notFound()

  const anio = new Date().getFullYear()
  const [resumen, datosMensuales, facturas, proveedores] = await Promise.all([
    getResumenDashboard(empresa.id),
    getDatosMensuales(empresa.id, anio),
    listFacturas(empresa.id),
    listProveedores(empresa.id),
  ])

  const ultimas = facturas.slice(0, 5)

  return (
    <div className="space-y-6">
      <Header
        title={empresa.nombre}
        description={`CIF: ${empresa.cif}`}
        action={
          <Button asChild variant="outline">
            <Link href={`/admin/clientes/${empresa.cif}/editar`}>
              <Edit className="h-4 w-4" />
              Editar
            </Link>
          </Button>
        }
      />

      <ResumenCards resumen={resumen} />
      <GraficaMensual datos={datosMensuales} />
      <UltimasFacturas facturas={ultimas} />

      <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
        <h3 className="mb-4 text-base font-semibold">Subir factura en nombre de {empresa.nombre}</h3>
        <FacturaUploader empresaId={empresa.id} />
      </div>

      {proveedores.length > 0 && (
        <div className="rounded-lg border border-[#E2E8F0] bg-white p-4 text-sm text-[#64748B]">
          {proveedores.length} proveedor{proveedores.length !== 1 ? "es" : ""} registrado{proveedores.length !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  )
}
