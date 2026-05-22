import Link from "next/link"
import { listEmpresas } from "@/lib/db/empresas"
import { ClienteTable } from "@/components/admin/ClienteTable"
import { Header } from "@/components/shared/Header"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default async function ClientesPage() {
  const clientes = await listEmpresas()

  return (
    <div>
      <Header
        title="Clientes"
        description={`${clientes.length} empresa${clientes.length !== 1 ? "s" : ""} registrada${clientes.length !== 1 ? "s" : ""}`}
        action={
          <Button asChild>
            <Link href="/admin/clientes/nueva">
              <Plus className="h-4 w-4" />
              Nuevo cliente
            </Link>
          </Button>
        }
      />
      <ClienteTable clientes={clientes} />
    </div>
  )
}
