import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { listProveedores } from "@/lib/db/proveedores";
import { Header } from "@/components/shared/Header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function ProveedoresPage() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const proveedores = await listProveedores(session.user.empresaId!);

  return (
    <div>
      <Header title="Proveedores" description="Todos tus proveedores y clientes ordenados por importe" />

      {proveedores.length === 0 ? (
        <EmptyState
          title="Sin proveedores"
          description="Los proveedores aparecerán automáticamente al procesar facturas."
        />
      ) : (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CIF</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Nº Facturas</TableHead>
                <TableHead className="text-right">Total facturado</TableHead>
                <TableHead className="text-right">Media/factura</TableHead>
                <TableHead>Primera factura</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proveedores.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.cif}</TableCell>
                  <TableCell className="font-medium text-sm">{p.nombre}</TableCell>
                  <TableCell className="text-[#64748B] text-sm">{p.email ?? "—"}</TableCell>
                  <TableCell className="text-[#64748B] text-sm">{p.telefono ?? "—"}</TableCell>
                  <TableCell className="text-right font-semibold">{p.totalFacturas}</TableCell>
                  <TableCell className="text-right font-bold tabular-nums">
                    {formatCurrency(Number(p.totalImporte))}
                  </TableCell>
                  <TableCell className="text-right tabular-nums text-sm">
                    {p.totalFacturas > 0 ? formatCurrency(Number(p.totalImporte) / p.totalFacturas) : "—"}
                  </TableCell>
                  <TableCell className="text-[#64748B] text-sm">{formatDate(p.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
