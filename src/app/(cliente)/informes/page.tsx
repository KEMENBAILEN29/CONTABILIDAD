"use client";
import { useState } from "react";
import { Header } from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, FileText, Loader2 } from "lucide-react";

const INFORMES = [
  { id: "pyg", label: "Pérdidas y Ganancias", description: "Ingresos y gastos del período con resultado del ejercicio" },
  { id: "gastos-ingresos", label: "Libro de Gastos e Ingresos", description: "Tabla cronológica con todas las facturas del período" },
  { id: "balance", label: "Balance", description: "Activo y pasivo simplificado de la empresa" },
  { id: "iva-trimestral", label: "Resumen IVA Trimestral", description: "IVA soportado y repercutido por trimestre" },
];

export default function InformesPage() {
  const currentYear = new Date().getFullYear();
  const [informe, setInforme] = useState("");
  const [desde, setDesde] = useState(`${currentYear}-01-01`);
  const [hasta, setHasta] = useState(`${currentYear}-12-31`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDescargar() {
    if (!informe) { setError("Selecciona un tipo de informe"); return; }
    if (!desde || !hasta) { setError("Selecciona un rango de fechas"); return; }

    setError("");
    setLoading(true);
    try {
      const url = `/api/informes/${informe}?desde=${desde}&hasta=${hasta}`;
      const res = await fetch(url);
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Error al generar el informe");
      }
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const selectedInforme = INFORMES.find((i) => i.id === informe);
      link.download = `${selectedInforme?.label ?? informe}_${desde}_${hasta}.pdf`;
      link.click();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al descargar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <Header title="Informes" description="Genera y descarga tus informes financieros en PDF" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader><CardTitle className="text-base">Configurar informe</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
              <div className="space-y-2">
                <Label>Tipo de informe</Label>
                <Select value={informe} onValueChange={setInforme}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar..." /></SelectTrigger>
                  <SelectContent>
                    {INFORMES.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{i.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="desde">Fecha inicio</Label>
                <Input id="desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hasta">Fecha fin</Label>
                <Input id="hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
              </div>
              <Button className="w-full" onClick={handleDescargar} disabled={loading || !informe}>
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Generando...</>
                ) : (
                  <><Download className="mr-2 h-4 w-4" />Descargar PDF</>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {INFORMES.map((i) => (
              <Card
                key={i.id}
                className={`cursor-pointer transition-colors ${informe === i.id ? "border-[#2563EB] ring-1 ring-[#2563EB]" : "hover:border-[#2563EB]/50"}`}
                onClick={() => setInforme(i.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[6px] ${informe === i.id ? "bg-[#2563EB]" : "bg-slate-100"}`}>
                      <FileText className={`h-4 w-4 ${informe === i.id ? "text-white" : "text-[#64748B]"}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[#0F172A]">{i.label}</p>
                      <p className="mt-0.5 text-xs text-[#64748B]">{i.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
