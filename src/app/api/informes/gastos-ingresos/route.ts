import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getEmpresaById } from "@/lib/db/empresas";
import { getFacturasForInforme } from "@/lib/db/facturas";
import { renderPDF } from "@/lib/pdf/render";
import { GastosIngresosDocument } from "@/lib/pdf/gastos-ingresos";
import { InformeQuerySchema } from "@/lib/validators";
import React from "react";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const parsed = InformeQuerySchema.safeParse({
    desde: url.searchParams.get("desde"),
    hasta: url.searchParams.get("hasta"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Fechas inválidas" }, { status: 400 });
  }
  const { desde, hasta } = parsed.data;

  const empresaId = session.user.role === "CLIENTE" ? session.user.empresaId! : (url.searchParams.get("empresaId") ?? "");
  if (!empresaId) return NextResponse.json({ error: "empresaId requerido" }, { status: 400 });

  const empresa = await getEmpresaById(empresaId);
  if (!empresa) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });

  const facturas = await getFacturasForInforme(empresaId, new Date(desde), new Date(hasta));

  const items = facturas.map((f) => ({
    fecha: f.fechaFactura ? new Date(f.fechaFactura).toLocaleDateString("es-ES") : "—",
    numero: f.numeroFactura ?? "—",
    emisor: f.emisorNombre ?? "—",
    concepto: f.concepto ?? "—",
    base: Number(f.baseImponible ?? 0),
    iva: Number(f.ivaPorcentaje ?? 0),
    total: Number(f.total ?? 0),
    tipo: f.tipo ?? "—",
  }));

  const totalIngresos = items.filter((i) => i.tipo === "INGRESO" || i.tipo === "AMBAS").reduce((s, i) => s + i.total, 0);
  const totalGastos = items.filter((i) => i.tipo === "GASTO" || i.tipo === "AMBAS").reduce((s, i) => s + i.total, 0);

  const pdfBlob = await renderPDF(
    React.createElement(GastosIngresosDocument, {
      data: { empresa: empresa.nombre, desde, hasta, items, totalIngresos, totalGastos },
    })
  );

  return new NextResponse(pdfBlob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="gastos_ingresos_${desde}_${hasta}.pdf"`,
    },
  });
}
