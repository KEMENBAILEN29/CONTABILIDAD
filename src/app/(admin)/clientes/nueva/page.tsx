import { NuevoClienteForm } from "@/components/admin/NuevoClienteForm"
import { Header } from "@/components/shared/Header"

export default function NuevoClientePage() {
  return (
    <div>
      <Header title="Nuevo cliente" description="Registra una nueva empresa en el sistema" />
      <NuevoClienteForm />
    </div>
  )
}
