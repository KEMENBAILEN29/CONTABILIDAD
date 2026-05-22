import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { getFacturasRango } from "@/lib/db/facturas"
import { getEmpresaById } from "@/lib/db/empresas"
import { renderPDF } from "@/lib/pdf/render"
import { PYGDocument } from "@/lib/pdf/pyg"
import React from "react"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const desde = searchParams.get("desde") ?? `${new Date().getFullYear()}-01-01`
  const hasta = searchParams.get("hasta") ?? `${new Date().getFullYear()}-12-31`
  const empresaIdParam = searchParams.get("empresaId")

  let empresaId: string
  if (session.user.role === "ADMIN") {
    if (!empresaIdParam) return NextResponse.json({ error: "empresaId requerido" }, { status: 400 })
    empresaId = empresaIdParam
  } else {
    if (!session.user.empresaId) return NextResponse.json({ error: "Sin empresa" }, { status: 403 })
    empresaId = session.user.empresaId
  }

  const empresa = await getEmpresaById(empresaId)
  if (!empresa) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 })

  const facturas = await getFacturasRango(empresaId, new Date(desde), new Date(hasta))
  const facturasMapped = facturas.map((f) => ({
    ...f,
    baseImponible: f.baseImponible ? String(f.baseImponible) : null,
    ivaPorcentaje: f.ivaPorcentaje ? String(f.ivaPorcentaje) : null,
    ivaImporte: f.ivaImporte ? String(f.ivaImporte) : null,
    total: f.total ? String(f.total) : null,
    lineas: [],
  }))

  const buffer = await renderPDF(React.createElement(PYGDocument, {
    empresa,
    desde: new Date(desde),
    hasta: new Date(hasta),
    facturas: facturasMapped,
  }))

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="pyg-${desde}-${hasta}.pdf"`,
    },
  })
}
