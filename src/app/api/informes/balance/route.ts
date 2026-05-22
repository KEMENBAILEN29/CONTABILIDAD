import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getEmpresaById } from "@/lib/db/empresas";
import { getFacturasForInforme } from "@/lib/db/facturas";
import { renderPDF } from "@/lib/pdf/render";
import { BalanceDocument } from "@/lib/pdf/balance";
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

  const ingresos = facturas.filter((f) => f.tipo === "INGRESO" || f.tipo === "AMBAS");
  const gastos = facturas.filter((f) => f.tipo === "GASTO" || f.tipo === "AMBAS");

  const totalIngresos = ingresos.reduce((s, f) => s + Number(f.total ?? 0), 0);
  const totalGastos = gastos.reduce((s, f) => s + Number(f.total ?? 0), 0);
  const resultado = totalIngresos - totalGastos;

  const activo = [
    { nombre: "Derechos de cobro (ingresos)", importe: totalIngresos },
    { nombre: "Resultado del período", importe: resultado > 0 ? resultado : 0 },
  ];

  const pasivo = [
    { nombre: "Obligaciones de pago (gastos)", importe: totalGastos },
    { nombre: "Resultado del período", importe: resultado < 0 ? Math.abs(resultado) : 0 },
  ];

  const pdfBlob = await renderPDF(
    React.createElement(BalanceDocument, {
      data: {
        empresa: empresa.nombre,
        fecha: hasta,
        activo,
        pasivo,
        totalActivo: totalIngresos,
        totalPasivo: totalGastos,
      },
    })
  );

  return new NextResponse(pdfBlob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="balance_${hasta}.pdf"`,
    },
  });
}
