import { Badge } from "@/components/ui/badge"
import type { EstadoFactura } from "@/types"

export function EstadoBadge({ estado }: { estado: EstadoFactura }) {
  if (estado === "PROCESADA") return <Badge variant="success">Procesada</Badge>
  if (estado === "ERROR") return <Badge variant="destructive">Error</Badge>
  return <Badge variant="warning">Procesando</Badge>
}
