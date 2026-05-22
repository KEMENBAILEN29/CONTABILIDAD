import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { getFacturasRango } from "@/lib/db/facturas"
import { getEmpresaById } from "@/lib/db/empresas"
import { renderPDF } from "@/lib/pdf/render"
import { IVATrimestralDocument } from "@/lib/pdf/iva-trimestral"
import React from "react"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const anio = parseInt(searchParams.get("anio") ?? String(new Date().getFullYear()), 10)
  const empresaIdParam = searchParams.get("empresaId")

  const empresaId = session.user.role === "ADMIN" ? empresaIdParam : session.user.empresaId
  if (!empresaId) return NextResponse.json({ error: "Sin empresa" }, { status: 403 })

  const empresa = await getEmpresaById(empresaId)
  if (!empresa) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  const facturas = await getFacturasRango(empresaId, new Date(`${anio}-01-01`), new Date(`${anio}-12-31`))
  const facturasMapped = facturas.map((f) => ({
    ...f,
    baseImponible: f.baseImponible ? String(f.baseImponible) : null,
    ivaPorcentaje: f.ivaPorcentaje ? String(f.ivaPorcentaje) : null,
    ivaImporte: f.ivaImporte ? String(f.ivaImporte) : null,
    total: f.total ? String(f.total) : null,
    lineas: [],
  }))

  const buffer = await renderPDF(React.createElement(IVATrimestralDocument, {
    empresa,
    anio,
    facturas: facturasMapped,
  }))

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="iva-trimestral-${anio}.pdf"`,
    },
  })
}
