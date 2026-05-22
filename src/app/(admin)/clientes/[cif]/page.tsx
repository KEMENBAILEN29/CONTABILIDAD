import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { getEmpresaByCif } from "@/lib/db/empresas";
import { getDashboardStats, getUltimasFacturas, listFacturas } from "@/lib/db/facturas";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { formatCurrency, formatDate } from "@/lib/utils";
import { EstadoBadge } from "@/components/facturas/EstadoBadge";
import { TrendingUp, TrendingDown, Scale, Clock } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminClientePage({ params }: { params: Promise<{ cif: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const { cif } = await params;
  const empresa = await getEmpresaByCif(cif);
  if (!empresa) notFound();

  const [stats, ultimas, facturas] = await Promise.all([
    getDashboardStats(empresa.id),
    getUltimasFacturas(empresa.id, 5),
    listFacturas(empresa.id, {}),
  ]);

  return (
    <div>
      <Header title={empresa.nombre} description={`CIF: ${empresa.cif} · ${empresa.activo ? "Activa" : "Inactiva"}`}>
        <Link href={`/admin/clientes/${cif}/editar`}>
          <Button variant="outline" size="sm">Editar</Button>
        </Link>
        <Link href="/admin/clientes">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
      </Header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#64748B]">Ingresos</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#16A34A]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#16A34A] tabular-nums">{formatCurrency(stats.totalIngresos)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#64748B]">Gastos</CardTitle>
            <TrendingDown className="h-4 w-4 text-[#DC2626]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#DC2626] tabular-nums">{formatCurrency(stats.totalGastos)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#64748B]">Balance</CardTitle>
            <Scale className="h-4 w-4 text-[#2563EB]" />
          </CardHeader>
          <CardContent>
            <div className={`text-xl font-bold tabular-nums ${stats.balanceNeto >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
              {formatCurrency(stats.balanceNeto)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-[#64748B]">Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-[#D97706]" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-[#D97706]">{stats.facturasPendientes}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Últimas facturas ({facturas.length} total)</CardTitle>
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
              {ultimas.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="font-medium text-sm">{f.archivoNombre}</TableCell>
                  <TableCell className="text-[#64748B] text-sm">{formatDate(f.fechaFactura)}</TableCell>
                  <TableCell className="text-sm">{f.tipo ?? "—"}</TableCell>
                  <TableCell className="text-right tabular-nums font-semibold">{formatCurrency(f.total ? Number(f.total) : null)}</TableCell>
                  <TableCell><EstadoBadge estado={f.estado} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
