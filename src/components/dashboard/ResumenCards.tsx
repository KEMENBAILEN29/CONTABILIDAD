import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Scale, Clock } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { DashboardStats } from "@/types";

interface ResumenCardsProps {
  stats: DashboardStats;
}

export function ResumenCards({ stats }: ResumenCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-[#64748B]">Total ingresos</CardTitle>
          <TrendingUp className="h-4 w-4 text-[#16A34A]" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-[#16A34A] tabular-nums">
            {formatCurrency(stats.totalIngresos)}
          </div>
          <p className="text-xs text-[#64748B] mt-1">Año actual</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-[#64748B]">Total gastos</CardTitle>
          <TrendingDown className="h-4 w-4 text-[#DC2626]" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-[#DC2626] tabular-nums">
            {formatCurrency(stats.totalGastos)}
          </div>
          <p className="text-xs text-[#64748B] mt-1">Año actual</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-[#64748B]">Balance neto</CardTitle>
          <Scale className="h-4 w-4 text-[#2563EB]" />
        </CardHeader>
        <CardContent>
          <div className={`text-xl font-bold tabular-nums ${stats.balanceNeto >= 0 ? "text-[#16A34A]" : "text-[#DC2626]"}`}>
            {formatCurrency(stats.balanceNeto)}
          </div>
          <p className="text-xs text-[#64748B] mt-1">Ingresos - Gastos</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xs font-medium text-[#64748B]">Pendientes</CardTitle>
          <Clock className="h-4 w-4 text-[#D97706]" />
        </CardHeader>
        <CardContent>
          <div className="text-xl font-bold text-[#D97706]">{stats.facturasPendientes}</div>
          <p className="text-xs text-[#64748B] mt-1">En proceso</p>
        </CardContent>
      </Card>
    </div>
  );
}
