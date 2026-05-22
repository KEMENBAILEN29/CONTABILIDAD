import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoBadge } from "./EstadoBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";
import type { FacturaRow } from "@/types";

interface FacturaTableProps {
  facturas: FacturaRow[];
}

export function FacturaTable({ facturas }: FacturaTableProps) {
  if (facturas.length === 0) {
    return (
      <EmptyState
        title="Sin facturas"
        description="Sube tu primera factura para comenzar a gestionarla con IA."
      />
    );
  }

  return (
    <div className="rounded-[8px] border border-[#E2E8F0] bg-white overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Archivo</TableHead>
            <TableHead>Nº Factura</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Emisor</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Estado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {facturas.map((f) => (
            <TableRow key={f.id}>
              <TableCell>
                <Link href={`/facturas/${f.id}`} className="text-sm font-medium text-[#2563EB] hover:underline truncate max-w-[160px] block">
                  {f.archivoNombre}
                </Link>
              </TableCell>
              <TableCell className="text-sm font-mono">{f.numeroFactura ?? "—"}</TableCell>
              <TableCell className="text-sm text-[#64748B]">{formatDate(f.fechaFactura)}</TableCell>
              <TableCell className="text-sm">{f.emisorNombre ?? "—"}</TableCell>
              <TableCell className="text-sm">{f.tipo ?? "—"}</TableCell>
              <TableCell className="text-right font-semibold tabular-nums text-sm">
                {formatCurrency(f.total ? Number(f.total) : null)}
              </TableCell>
              <TableCell><EstadoBadge estado={f.estado} /></TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
