import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getEmpresaById } from "@/lib/db/empresas";
import { getFacturasForInforme } from "@/lib/db/facturas";
import { renderPDF } from "@/lib/pdf/render";
import { PYGDocument } from "@/lib/pdf/pyg";
import { InformeQuerySchema } from "@/lib/validators";
import React from "react";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const url = new URL(req.url);
  const empresaIdParam = url.searchParams.get("empresaId");

  const parsed = InformeQuerySchema.safeParse({
    desde: url.searchParams.get("desde"),
    hasta: url.searchParams.get("hasta"),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Fechas inválidas" }, { status: 400 });
  }
  const { desde, hasta } = parsed.data;

  let empresaId: string;
  let empresaNombre: string;

  if (session.user.role === "CLIENTE") {
    empresaId = session.user.empresaId!;
    const empresa = await getEmpresaById(empresaId);
    empresaNombre = empresa?.nombre ?? "Empresa";
  } else {
    if (!empresaIdParam) return NextResponse.json({ error: "empresaId requerido" }, { status: 400 });
    const empresa = await getEmpresaById(empresaIdParam);
    if (!empresa) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    empresaId = empresa.id;
    empresaNombre = empresa.nombre;
  }

  const facturas = await getFacturasForInforme(empresaId, new Date(desde), new Date(hasta));

  const ingresos = facturas.filter((f) => f.tipo === "INGRESO" || f.tipo === "AMBAS").map((f) => ({
    concepto: f.concepto ?? f.emisorNombre ?? "Ingreso",
    importe: Number(f.total ?? 0),
  }));

  const gastos = facturas.filter((f) => f.tipo === "GASTO" || f.tipo === "AMBAS").map((f) => ({
    concepto: f.concepto ?? f.emisorNombre ?? "Gasto",
    importe: Number(f.total ?? 0),
  }));

  const totalIngresos = ingresos.reduce((s, i) => s + i.importe, 0);
  const totalGastos = gastos.reduce((s, g) => s + g.importe, 0);

  const pdfBlob = await renderPDF(
    React.createElement(PYGDocument, {
      data: { empresa: empresaNombre, desde, hasta, ingresos, gastos, totalIngresos, totalGastos, resultado: totalIngresos - totalGastos },
    })
  );

  return new NextResponse(pdfBlob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pyg_${desde}_${hasta}.pdf"`,
    },
  });
}
