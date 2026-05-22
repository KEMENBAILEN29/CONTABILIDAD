import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { listFacturas } from "@/lib/db/facturas"
import { Header } from "@/components/shared/Header"
import { FacturaUploader } from "@/components/facturas/FacturaUploader"
import { FacturaTable } from "@/components/facturas/FacturaTable"

export default async function FacturasPage() {
  const session = await auth()
  if (!session?.user.empresaId) redirect("/login")

  const facturas = await listFacturas(session.user.empresaId)

  return (
    <div>
      <Header title="Facturas" description="Sube y gestiona tus facturas" />
      <FacturaUploader />
      <FacturaTable facturas={facturas} />
    </div>
  )
}
