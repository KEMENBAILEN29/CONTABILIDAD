import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/client";
import { Header } from "@/components/shared/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, FileText, AlertCircle, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { EstadoBadge } from "@/components/facturas/EstadoBadge";
import { formatDate, formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  const [totalEmpresas, totalFacturas, facturasPendientes, recentEmpresas] = await Promise.all([
    db.empresa.count({ where: { activo: true } }),
    db.factura.count(),
    db.factura.count({ where: { estado: "PROCESANDO" } }),
    db.empresa.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: { id: true, cif: true, nombre: true, activo: true, createdAt: true },
    }),
  ]);

  const recentFacturas = await db.factura.findMany({
    take: 8,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      archivoNombre: true,
      estado: true,
      tipo: true,
      total: true,
      createdAt: true,
      empresa: { select: { nombre: true, cif: true } },
    },
  });

  return (
    <div>
      <Header
        title="Panel Administrador"
        description="Resumen global de la gestoría"
      >
        <Link href="/admin/clientes/nueva">
          <Button size="sm">+ Nueva empresa</Button>
        </Link>
      </Header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">Empresas activas</CardTitle>
            <Building2 className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">{totalEmpresas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">Total facturas</CardTitle>
            <FileText className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">{totalFacturas}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">Facturas pendientes</CardTitle>
            <AlertCircle className="h-4 w-4 text-[#D97706]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#D97706]">{facturasPendientes}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-[#64748B]">Clientes recientes</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#64748B]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#0F172A]">{recentEmpresas.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Empresas recientes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEmpresas.map((e) => (
                <div key={e.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0F172A]">{e.nombre}</p>
                    <p className="text-xs font-mono text-[#64748B]">{e.cif}</p>
                  </div>
                  <Link href={`/admin/clientes/${e.cif}`}>
                    <Button variant="ghost" size="sm">Ver</Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Últimas facturas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentFacturas.map((f) => (
                <div key={f.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-[#0F172A] truncate max-w-[160px]">{f.archivoNombre}</p>
                    <p className="text-xs text-[#64748B]">{f.empresa.nombre} · {formatDate(f.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {f.total && <span className="text-xs font-semibold text-[#0F172A] tabular-nums">{formatCurrency(Number(f.total))}</span>}
                    <EstadoBadge estado={f.estado} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
