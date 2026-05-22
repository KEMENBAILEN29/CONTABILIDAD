import { auth } from "@/lib/auth/auth"
import { notFound, redirect } from "next/navigation"
import Link from "next/link"
import { getFactura } from "@/lib/db/facturas"
import { FacturaDetalle } from "@/components/facturas/FacturaDetalle"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import type { FacturaConLineas } from "@/types"

interface Props {
  params: Promise<{ id: string }>
}

export default async function FacturaPage({ params }: Props) {
  const session = await auth()
  if (!session?.user.empresaId) redirect("/login")

  const { id } = await params
  const factura = await getFactura(id)

  if (!factura) notFound()

  // Ensure this factura belongs to the session empresa
  if (factura.empresaId !== session.user.empresaId && session.user.role !== "ADMIN") {
    notFound()
  }

  const facturaConLineas: FacturaConLineas = {
    ...factura,
    baseImponible: factura.baseImponible ? String(factura.baseImponible) : null,
    ivaPorcentaje: factura.ivaPorcentaje ? String(factura.ivaPorcentaje) : null,
    ivaImporte: factura.ivaImporte ? String(factura.ivaImporte) : null,
    total: factura.total ? String(factura.total) : null,
    lineas: factura.lineas.map((l) => ({
      ...l,
      cantidad: String(l.cantidad),
      precioUnitario: String(l.precioUnitario),
      ivaPorcentaje: String(l.ivaPorcentaje),
      subtotal: String(l.subtotal),
    })),
  }

  return (
    <div>
      <div className="mb-6">
        <Button asChild variant="ghost" size="sm">
          <Link href="/facturas">
            <ChevronLeft className="h-4 w-4" />
            Volver a facturas
          </Link>
        </Button>
      </div>
      <FacturaDetalle factura={facturaConLineas} />
    </div>
  )
}
