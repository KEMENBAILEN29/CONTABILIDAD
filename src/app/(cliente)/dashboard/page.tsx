import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { getResumenDashboard, getDatosMensuales, listFacturas } from "@/lib/db/facturas"
import { Header } from "@/components/shared/Header"
import { ResumenCards } from "@/components/dashboard/ResumenCards"
import { GraficaMensual } from "@/components/dashboard/GraficaMensual"
import { UltimasFacturas } from "@/components/dashboard/UltimasFacturas"

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user.empresaId) redirect("/login")

  const empresaId = session.user.empresaId
  const anio = new Date().getFullYear()

  const [resumen, datosMensuales, facturas] = await Promise.all([
    getResumenDashboard(empresaId),
    getDatosMensuales(empresaId, anio),
    listFacturas(empresaId),
  ])

  const ultimas = facturas.slice(0, 5)

  return (
    <div className="space-y-6">
      <Header
        title={`Bienvenido, ${session.user.name}`}
        description={`Panel financiero — ${anio}`}
      />
      <ResumenCards resumen={resumen} />
      <GraficaMensual datos={datosMensuales} />
      <UltimasFacturas facturas={ultimas} />
    </div>
  )
}
