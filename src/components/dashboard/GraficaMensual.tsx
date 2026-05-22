"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MensualData } from "@/types";

interface GraficaMensualProps {
  data: MensualData[];
}

export function GraficaMensual({ data }: GraficaMensualProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Ingresos vs Gastos — Año actual</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis dataKey="mes" tick={{ fontSize: 12, fill: "#64748B" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#64748B" }}
              tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k€`}
            />
            <Tooltip
              formatter={(value) =>
                typeof value === "number"
                  ? new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(value)
                  : value
              }
              contentStyle={{ fontSize: 12, borderColor: "#E2E8F0", borderRadius: 8 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="ingresos" name="Ingresos" fill="#16A34A" radius={[3, 3, 0, 0]} />
            <Bar dataKey="gastos" name="Gastos" fill="#DC2626" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
