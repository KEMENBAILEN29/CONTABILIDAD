import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db/client"
import { extractFromInvoice } from "@/lib/ocr/extract"
import { parseOCRResult } from "@/lib/ocr/parse"
import { classifyFactura } from "@/lib/ocr/classify"
import { upsertProveedor } from "@/lib/db/proveedores"
import { calcTrimestre, calcAnio } from "@/lib/utils"

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const
type AllowedMime = (typeof ALLOWED_MIME)[number]

export async function POST(req: NextRequest) {
  const body = await req.json() as { facturaId?: string }
  const { facturaId } = body

  if (!facturaId) return NextResponse.json({ error: "facturaId requerido" }, { status: 400 })

  const factura = await db.factura.findUnique({
    where: { id: facturaId },
    include: { empresa: true },
  })

  if (!factura) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 })

  try {
    // Download the file
    const fileRes = await fetch(factura.archivoUrl)
    if (!fileRes.ok) throw new Error("No se pudo descargar el archivo")

    const arrayBuffer = await fileRes.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const contentType = fileRes.headers.get("content-type") ?? ""
    const mimeType = ALLOWED_MIME.find((m) => contentType.startsWith(m)) ?? "application/pdf"

    // Call Claude API
    const rawJSON = await extractFromInvoice(buffer, mimeType as AllowedMime)
    const ocrData = parseOCRResult(rawJSON)

    // Classify
    const tipo = classifyFactura(ocrData.emisor_cif, ocrData.receptor_cif, factura.empresa.cif)

    // Calculate trimestre/anio
    const fechaFactura = ocrData.fecha_factura ? new Date(ocrData.fecha_factura) : null
    const trimestre = fechaFactura ? calcTrimestre(fechaFactura) : null
    const anio = fechaFactura ? calcAnio(fechaFactura) : null

    // Upsert proveedor (the CIF that is NOT the empresa)
    const empresaCif = factura.empresa.cif.toUpperCase()
    const emisorCif = ocrData.emisor_cif?.toUpperCase()
    const receptorCif = ocrData.receptor_cif?.toUpperCase()
    const proveedorCif = emisorCif !== empresaCif ? emisorCif : receptorCif
    const proveedorNombre = emisorCif !== empresaCif ? ocrData.emisor_nombre : ocrData.receptor_nombre

    if (proveedorCif && proveedorNombre && ocrData.total) {
      await upsertProveedor({
        empresaId: factura.empresaId,
        cif: proveedorCif,
        nombre: proveedorNombre,
        importe: ocrData.total,
      })
    }

    // Create lineas
    if (ocrData.lineas.length > 0) {
      await db.lineaFactura.createMany({
        data: ocrData.lineas.map((l) => ({
          facturaId,
          descripcion: l.descripcion,
          cantidad: l.cantidad,
          precioUnitario: l.precio_unitario,
          ivaPorcentaje: l.iva_porcentaje,
          subtotal: l.subtotal,
        })),
      })
    }

    // Update factura
    await db.factura.update({
      where: { id: facturaId },
      data: {
        estado: "PROCESADA",
        tipo,
        trimestre,
        anio,
        fechaFactura,
        numeroFactura: ocrData.numero_factura,
        emisorCif: ocrData.emisor_cif,
        emisorNombre: ocrData.emisor_nombre,
        receptorCif: ocrData.receptor_cif,
        receptorNombre: ocrData.receptor_nombre,
        baseImponible: ocrData.base_imponible,
        ivaPorcentaje: ocrData.iva_porcentaje,
        ivaImporte: ocrData.iva_importe,
        total: ocrData.total,
        concepto: ocrData.concepto,
      },
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : "Error desconocido"
    await db.factura.update({
      where: { id: facturaId },
      data: { estado: "ERROR", errorMensaje: errorMsg },
    })
    return NextResponse.json({ error: errorMsg }, { status: 500 })
  }
}
