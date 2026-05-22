import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { listProveedores } from "@/lib/db/proveedores"
import { Header } from "@/components/shared/Header"
import { ProveedorTable } from "@/components/proveedores/ProveedorTable"

export default async function ProveedoresPage() {
  const session = await auth()
  if (!session?.user.empresaId) redirect("/login")

  const proveedores = await listProveedores(session.user.empresaId)

  return (
    <div>
      <Header
        title="Proveedores"
        description="Proveedores identificados automáticamente de tus facturas"
      />
      <ProveedorTable proveedores={proveedores} />
    </div>
  )
}
