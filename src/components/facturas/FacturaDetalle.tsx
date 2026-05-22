"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { EstadoBadge } from "./EstadoBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { FacturaConLineas } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface FacturaDetalleProps {
  factura: FacturaConLineas;
  fileUrl: string | null;
}

export function FacturaDetalle({ factura, fileUrl }: FacturaDetalleProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    numeroFactura: factura.numeroFactura ?? "",
    fechaFactura: factura.fechaFactura ? new Date(factura.fechaFactura).toISOString().split("T")[0] : "",
    emisorCif: factura.emisorCif ?? "",
    emisorNombre: factura.emisorNombre ?? "",
    receptorCif: factura.receptorCif ?? "",
    receptorNombre: factura.receptorNombre ?? "",
    baseImponible: factura.baseImponible ? Number(factura.baseImponible).toString() : "",
    ivaPorcentaje: factura.ivaPorcentaje ? Number(factura.ivaPorcentaje).toString() : "",
    ivaImporte: factura.ivaImporte ? Number(factura.ivaImporte).toString() : "",
    total: factura.total ? Number(factura.total).toString() : "",
    concepto: factura.concepto ?? "",
    tipo: factura.tipo ?? "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/facturas/${factura.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          baseImponible: form.baseImponible ? parseFloat(form.baseImponible) : undefined,
          ivaPorcentaje: form.ivaPorcentaje ? parseFloat(form.ivaPorcentaje) : undefined,
          ivaImporte: form.ivaImporte ? parseFloat(form.ivaImporte) : undefined,
          total: form.total ? parseFloat(form.total) : undefined,
          tipo: form.tipo || undefined,
          fechaFactura: form.fechaFactura || undefined,
        }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        setError(data.error ?? "Error al guardar");
        return;
      }
      setEditing(false);
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!confirm("¿Eliminar esta factura permanentemente?")) return;
    await fetch(`/api/facturas/${factura.id}`, { method: "DELETE" });
    router.push("/facturas");
    router.refresh();
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Datos extraídos</CardTitle>
            <div className="flex items-center gap-2">
              <EstadoBadge estado={factura.estado} />
              {!editing ? (
                <Button size="sm" onClick={() => setEditing(true)}>Editar</Button>
              ) : (
                <>
                  <Button size="sm" onClick={handleSave} disabled={loading}>{loading ? "Guardando..." : "Guardar"}</Button>
                  <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancelar</Button>
                </>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
            {factura.errorMensaje && (
              <Alert variant="destructive">
                <AlertDescription>Error OCR: {factura.errorMensaje}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nº Factura</Label>
                {editing ? <Input value={form.numeroFactura} onChange={(e) => update("numeroFactura", e.target.value)} className="mt-1 h-8 text-sm" /> : <p className="mt-1 text-sm font-mono">{factura.numeroFactura ?? "—"}</p>}
              </div>
              <div>
                <Label className="text-xs">Fecha</Label>
                {editing ? <Input type="date" value={form.fechaFactura} onChange={(e) => update("fechaFactura", e.target.value)} className="mt-1 h-8 text-sm" /> : <p className="mt-1 text-sm">{formatDate(factura.fechaFactura)}</p>}
              </div>
              <div>
                <Label className="text-xs">Emisor CIF</Label>
                {editing ? <Input value={form.emisorCif} onChange={(e) => update("emisorCif", e.target.value)} className="mt-1 h-8 text-sm font-mono uppercase" /> : <p className="mt-1 text-sm font-mono">{factura.emisorCif ?? "—"}</p>}
              </div>
              <div>
                <Label className="text-xs">Emisor nombre</Label>
                {editing ? <Input value={form.emisorNombre} onChange={(e) => update("emisorNombre", e.target.value)} className="mt-1 h-8 text-sm" /> : <p className="mt-1 text-sm">{factura.emisorNombre ?? "—"}</p>}
              </div>
              <div>
                <Label className="text-xs">Receptor CIF</Label>
                {editing ? <Input value={form.receptorCif} onChange={(e) => update("receptorCif", e.target.value)} className="mt-1 h-8 text-sm font-mono uppercase" /> : <p className="mt-1 text-sm font-mono">{factura.receptorCif ?? "—"}</p>}
              </div>
              <div>
                <Label className="text-xs">Receptor nombre</Label>
                {editing ? <Input value={form.receptorNombre} onChange={(e) => update("receptorNombre", e.target.value)} className="mt-1 h-8 text-sm" /> : <p className="mt-1 text-sm">{factura.receptorNombre ?? "—"}</p>}
              </div>
              <div>
                <Label className="text-xs">Tipo</Label>
                {editing ? (
                  <Select value={form.tipo} onValueChange={(v) => update("tipo", v)}>
                    <SelectTrigger className="mt-1 h-8 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="INGRESO">INGRESO</SelectItem>
                      <SelectItem value="GASTO">GASTO</SelectItem>
                      <SelectItem value="AMBAS">AMBAS</SelectItem>
                    </SelectContent>
                  </Select>
                ) : <p className="mt-1 text-sm">{factura.tipo ?? "—"}</p>}
              </div>
              <div>
                <Label className="text-xs">Concepto</Label>
                {editing ? <Input value={form.concepto} onChange={(e) => update("concepto", e.target.value)} className="mt-1 h-8 text-sm" /> : <p className="mt-1 text-sm">{factura.concepto ?? "—"}</p>}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[#E2E8F0]">
              <div>
                <Label className="text-xs">Base imponible</Label>
                {editing ? <Input type="number" value={form.baseImponible} onChange={(e) => update("baseImponible", e.target.value)} className="mt-1 h-8 text-sm tabular-nums" /> : <p className="mt-1 text-sm font-semibold tabular-nums">{formatCurrency(factura.baseImponible ? Number(factura.baseImponible) : null)}</p>}
              </div>
              <div>
                <Label className="text-xs">IVA %</Label>
                {editing ? <Input type="number" value={form.ivaPorcentaje} onChange={(e) => update("ivaPorcentaje", e.target.value)} className="mt-1 h-8 text-sm" /> : <p className="mt-1 text-sm">{factura.ivaPorcentaje ? `${factura.ivaPorcentaje}%` : "—"}</p>}
              </div>
              <div>
                <Label className="text-xs">Total</Label>
                {editing ? <Input type="number" value={form.total} onChange={(e) => update("total", e.target.value)} className="mt-1 h-8 text-sm tabular-nums" /> : <p className="mt-1 text-sm font-bold tabular-nums text-[#0F172A]">{formatCurrency(factura.total ? Number(factura.total) : null)}</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        {factura.lineas.length > 0 && (
          <Card>
            <CardHeader><CardTitle className="text-base">Líneas de factura</CardTitle></CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descripción</TableHead>
                    <TableHead className="text-right">Cant.</TableHead>
                    <TableHead className="text-right">P/U</TableHead>
                    <TableHead className="text-right">IVA</TableHead>
                    <TableHead className="text-right">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {factura.lineas.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell className="text-sm">{l.descripcion}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{Number(l.cantidad)}</TableCell>
                      <TableCell className="text-right text-sm tabular-nums">{formatCurrency(Number(l.precioUnitario))}</TableCell>
                      <TableCell className="text-right text-sm">{Number(l.ivaPorcentaje)}%</TableCell>
                      <TableCell className="text-right font-semibold text-sm tabular-nums">{formatCurrency(Number(l.subtotal))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-end">
          <Button variant="destructive" size="sm" onClick={handleDelete}>Eliminar factura</Button>
        </div>
      </div>

      <div>
        <Card className="h-full">
          <CardHeader><CardTitle className="text-base">Vista previa</CardTitle></CardHeader>
          <CardContent>
            {fileUrl ? (
              factura.archivoUrl.endsWith(".pdf") ? (
                <iframe src={fileUrl} className="w-full h-[600px] rounded-[6px] border border-[#E2E8F0]" title="Factura" />
              ) : (
                <img src={fileUrl} alt="Factura" className="w-full rounded-[6px] border border-[#E2E8F0] object-contain max-h-[600px]" />
              )
            ) : (
              <div className="flex h-40 items-center justify-center text-[#64748B] text-sm">
                Vista previa no disponible
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
