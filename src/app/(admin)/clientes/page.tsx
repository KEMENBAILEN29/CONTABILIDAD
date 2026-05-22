import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { listEmpresas } from "@/lib/db/empresas";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "@/components/shared/EmptyState";

export default async function ClientesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const empresas = await listEmpresas();

  return (
    <div>
      <Header title="Empresas clientes" description="Gestiona todas las empresas de la gestoría">
        <Link href="/admin/clientes/nueva">
          <Button size="sm">+ Nueva empresa</Button>
        </Link>
      </Header>

      {empresas.length === 0 ? (
        <EmptyState
          title="Sin empresas registradas"
          description="Crea tu primera empresa cliente para comenzar."
        >
          <Link href="/admin/clientes/nueva">
            <Button>Crear empresa</Button>
          </Link>
        </EmptyState>
      ) : (
        <div className="rounded-[8px] border border-[#E2E8F0] bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CIF</TableHead>
                <TableHead>Razón social</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Alta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {empresas.map((empresa) => (
                <TableRow key={empresa.id}>
                  <TableCell className="font-mono text-xs">{empresa.cif}</TableCell>
                  <TableCell className="font-medium">{empresa.nombre}</TableCell>
                  <TableCell className="text-[#64748B]">{empresa.email ?? "—"}</TableCell>
                  <TableCell className="text-[#64748B]">{empresa.telefono ?? "—"}</TableCell>
                  <TableCell>
                    <Badge variant={empresa.activo ? "success" : "secondary"}>
                      {empresa.activo ? "Activa" : "Inactiva"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#64748B] text-sm">{formatDate(empresa.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Link href={`/admin/clientes/${empresa.cif}`}>
                        <Button variant="ghost" size="sm">Ver</Button>
                      </Link>
                      <Link href={`/admin/clientes/${empresa.cif}/editar`}>
                        <Button variant="ghost" size="sm">Editar</Button>
                      </Link>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
