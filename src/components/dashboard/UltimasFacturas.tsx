import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EstadoBadge } from "@/components/facturas/EstadoBadge";
import { formatDate, formatCurrency } from "@/lib/utils";
import type { FacturaRow } from "@/types";

interface UltimasFacturasProps {
  facturas: FacturaRow[];
}

export function UltimasFacturas({ facturas }: UltimasFacturasProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-base">Últimas facturas</CardTitle>
        <Link href="/facturas" className="text-xs text-[#2563EB] hover:underline">Ver todas</Link>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Archivo</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead>Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {facturas.map((f) => (
              <TableRow key={f.id}>
                <TableCell>
                  <Link href={`/facturas/${f.id}`} className="text-sm font-medium text-[#2563EB] hover:underline truncate max-w-[180px] block">
                    {f.archivoNombre}
                  </Link>
                </TableCell>
                <TableCell className="text-sm text-[#64748B]">{formatDate(f.fechaFactura)}</TableCell>
                <TableCell className="text-sm">{f.tipo ?? "—"}</TableCell>
                <TableCell className="text-right font-semibold tabular-nums text-sm">
                  {formatCurrency(f.total ? Number(f.total) : null)}
                </TableCell>
                <TableCell><EstadoBadge estado={f.estado} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
