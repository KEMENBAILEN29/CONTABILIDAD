"use client"

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { getMesNombre } from "@/lib/utils"

interface DatosMes {
  mes: number
  ingresos: number
  gastos: number
}

interface GraficaMensualProps {
  datos: DatosMes[]
}

const formatEuro = (value: number) =>
  new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value)

export function GraficaMensual({ datos }: GraficaMensualProps) {
  const data = datos.map((d) => ({
    name: getMesNombre(d.mes),
    Ingresos: d.ingresos,
    Gastos: d.gastos,
  }))

  return (
    <div className="rounded-lg border border-[#E2E8F0] bg-white p-6">
      <h3 className="mb-4 text-base font-semibold text-[#0F172A]">Ingresos vs Gastos (año actual)</h3>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} barGap={4} barCategoryGap="30%">
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748B" }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatEuro} tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={80} />
          <Tooltip
            formatter={(value: number) => formatEuro(value)}
            contentStyle={{ border: "1px solid #E2E8F0", borderRadius: 8, fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 12 }} />
          <Bar dataKey="Ingresos" fill="#16A34A" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Gastos" fill="#DC2626" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
