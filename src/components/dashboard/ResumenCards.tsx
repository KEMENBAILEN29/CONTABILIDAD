import { TrendingUp, TrendingDown, Scale, Clock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { formatCurrency } from "@/lib/utils"
import type { ResumenDashboard } from "@/types"

export function ResumenCards({ resumen }: { resumen: ResumenDashboard }) {
  const cards = [
    {
      label: "Total Ingresos",
      value: formatCurrency(resumen.totalIngresos),
      icon: TrendingUp,
      color: "text-[#16A34A]",
      bg: "bg-green-50",
    },
    {
      label: "Total Gastos",
      value: formatCurrency(resumen.totalGastos),
      icon: TrendingDown,
      color: "text-[#DC2626]",
      bg: "bg-red-50",
    },
    {
      label: "Balance",
      value: formatCurrency(resumen.balance),
      icon: Scale,
      color: resumen.balance >= 0 ? "text-[#2563EB]" : "text-[#DC2626]",
      bg: "bg-blue-50",
    },
    {
      label: "Facturas Pendientes",
      value: String(resumen.facturasPendientes),
      icon: Clock,
      color: "text-[#D97706]",
      bg: "bg-amber-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[#64748B]">{c.label}</p>
                <p className={`mt-1 text-2xl font-semibold tabular-nums ${c.color}`}>{c.value}</p>
              </div>
              <div className={`rounded-lg p-3 ${c.bg}`}>
                <c.icon className={`h-5 w-5 ${c.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
