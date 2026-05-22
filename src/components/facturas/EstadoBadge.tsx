import { Badge } from "@/components/ui/badge";
import type { EstadoFactura } from "@/types";

interface EstadoBadgeProps {
  estado: EstadoFactura;
}

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const config = {
    PROCESANDO: { variant: "warning" as const, label: "Procesando" },
    PROCESADA: { variant: "success" as const, label: "Procesada" },
    ERROR: { variant: "destructive" as const, label: "Error" },
  };
  const { variant, label } = config[estado];
  return <Badge variant={variant}>{label}</Badge>;
}
