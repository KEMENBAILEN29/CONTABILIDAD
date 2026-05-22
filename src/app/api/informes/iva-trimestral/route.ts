import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getEmpresaById } from "@/lib/db/empresas";
import { getFacturasForInforme } from "@/lib/db/facturas";
import { renderPDF } from "@/lib/pdf/render";
import { IVATrimestralDocument } from "@/lib/pdf/iva-trimestral";
import { InformeQuerySchema } from "@/lib/validators";
import { calcTrimestre } from "@/lib/utils";
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
  const año = new Date(desde).getFullYear();

  const trimestresData = [1, 2, 3, 4].map((t) => {
    const trimFacturas = facturas.filter((f) => calcTrimestre(f.fechaFactura) === t);
    const ingresos = trimFacturas.filter((f) => f.tipo === "INGRESO" || f.tipo === "AMBAS");
    const gastos = trimFacturas.filter((f) => f.tipo === "GASTO" || f.tipo === "AMBAS");

    const baseRepercutida = ingresos.reduce((s, f) => s + Number(f.baseImponible ?? 0), 0);
    const ivaRepercutido = ingresos.reduce((s, f) => s + Number(f.ivaImporte ?? 0), 0);
    const baseSoportada = gastos.reduce((s, f) => s + Number(f.baseImponible ?? 0), 0);
    const ivaSoportado = gastos.reduce((s, f) => s + Number(f.ivaImporte ?? 0), 0);

    return {
      trimestre: `T${t} ${año}`,
      baseRepercutida,
      ivaRepercutido,
      baseSoportada,
      ivaSoportado,
      diferencia: ivaRepercutido - ivaSoportado,
    };
  });

  const totalRepercutido = trimestresData.reduce((s, t) => s + t.ivaRepercutido, 0);
  const totalSoportado = trimestresData.reduce((s, t) => s + t.ivaSoportado, 0);
  const totalDiferencia = totalRepercutido - totalSoportado;

  const pdfBlob = await renderPDF(
    React.createElement(IVATrimestralDocument, {
      data: { empresa: empresa.nombre, año, trimestres: trimestresData, totalRepercutido, totalSoportado, totalDiferencia },
    })
  );

  return new NextResponse(pdfBlob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="iva_trimestral_${año}.pdf"`,
    },
  });
}
