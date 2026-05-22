"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Download } from "lucide-react"

const INFORMES = [
  { value: "pyg", label: "Pérdidas y Ganancias" },
  { value: "gastos-ingresos", label: "Libro de Gastos e Ingresos" },
  { value: "balance", label: "Balance de Situación" },
  { value: "iva-trimestral", label: "Resumen Trimestral IVA" },
]

interface SelectorInformeProps {
  empresaId?: string
}

export function SelectorInforme({ empresaId }: SelectorInformeProps) {
  const [tipo, setTipo] = useState("")
  const [desde, setDesde] = useState("")
  const [hasta, setHasta] = useState("")
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    if (!tipo) return
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (desde) params.set("desde", desde)
      if (hasta) params.set("hasta", hasta)
      if (empresaId) params.set("empresaId", empresaId)

      const res = await fetch(`/api/informes/${tipo}?${params}`)
      if (!res.ok) throw new Error("Error al generar informe")

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${tipo}-${Date.now()}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error al descargar")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-lg rounded-lg border border-[#E2E8F0] bg-white p-6 space-y-4">
      <div>
        <Label>Tipo de informe</Label>
        <Select value={tipo} onValueChange={setTipo}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Selecciona un informe" />
          </SelectTrigger>
          <SelectContent>
            {INFORMES.map((i) => (
              <SelectItem key={i.value} value={i.value}>
                {i.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="desde">Desde</Label>
          <Input id="desde" type="date" className="mt-1" value={desde} onChange={(e) => setDesde(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="hasta">Hasta</Label>
          <Input id="hasta" type="date" className="mt-1" value={hasta} onChange={(e) => setHasta(e.target.value)} />
        </div>
      </div>

      <Button onClick={handleDownload} disabled={!tipo || loading} className="gap-2">
        <Download className="h-4 w-4" />
        {loading ? "Generando..." : "Descargar PDF"}
      </Button>
    </div>
  )
}
