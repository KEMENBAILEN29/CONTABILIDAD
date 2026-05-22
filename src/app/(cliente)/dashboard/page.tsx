import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getDashboardStats, getMensualData, getUltimasFacturas } from "@/lib/db/facturas";
import { Header } from "@/components/shared/Header";
import { ResumenCards } from "@/components/dashboard/ResumenCards";
import { GraficaMensual } from "@/components/dashboard/GraficaMensual";
import { UltimasFacturas } from "@/components/dashboard/UltimasFacturas";

export default async function DashboardPage() {
  const session = await auth();
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const empresaId = session.user.empresaId!;
  const currentYear = new Date().getFullYear();

  const [stats, mensual, ultimas] = await Promise.all([
    getDashboardStats(empresaId),
    getMensualData(empresaId, currentYear),
    getUltimasFacturas(empresaId, 5),
  ]);

  return (
    <div>
      <Header
        title={`Bienvenido, ${session.user.name}`}
        description={`Resumen financiero ${currentYear}`}
      />
      <ResumenCards stats={stats} />
      <div className="mt-6">
        <GraficaMensual data={mensual} />
      </div>
      <div className="mt-6">
        <UltimasFacturas facturas={ultimas} />
      </div>
    </div>
  );
}
