import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/shared/Header"
import { EscanerCliente } from "@/components/escaner/EscanerCliente"

export default async function EscanerPage() {
  const session = await auth()
  if (!session?.user.empresaId) redirect("/login")

  return (
    <div>
      <Header title="Escanear Factura" description="Extrae los datos de tu factura con IA" />
      <EscanerCliente empresaId={session.user.empresaId} />
    </div>
  )
}
