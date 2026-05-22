import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { downloadFactura } from "@/lib/storage/upload";
import { extractFromInvoice } from "@/lib/ocr/extract";
import { parseOCRResult } from "@/lib/ocr/parse";
import { classifyFactura } from "@/lib/ocr/classify";
import { upsertProveedor } from "@/lib/db/proveedores";
import { calcTrimestre, calcAño } from "@/lib/utils";

type AllowedMimeType = "application/pdf" | "image/jpeg" | "image/png" | "image/webp";

function getMimeFromPath(path: string): AllowedMimeType {
  const ext = path.split(".").pop()?.toLowerCase();
  const map: Record<string, AllowedMimeType> = {
    pdf: "application/pdf",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
  };
  return map[ext ?? ""] ?? "application/pdf";
}

export async function POST(req: NextRequest) {
  const body = await req.json() as { facturaId?: string };
  const { facturaId } = body;

  if (!facturaId) return NextResponse.json({ error: "facturaId requerido" }, { status: 400 });

  const factura = await db.factura.findUnique({
    where: { id: facturaId },
    include: { empresa: true },
  });

  if (!factura) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });

  try {
    // Download file
    const fileBuffer = await downloadFactura(factura.archivoUrl);
    const mimeType = getMimeFromPath(factura.archivoUrl);

    // OCR extraction
    const rawJson = await extractFromInvoice(fileBuffer, mimeType);
    const ocrData = parseOCRResult(rawJson);

    // Classify
    const tipo = classifyFactura(
      ocrData.emisor_cif,
      ocrData.receptor_cif,
      factura.empresa.cif
    );

    // Determine date
    const fechaFactura = ocrData.fecha_factura ? new Date(ocrData.fecha_factura) : null;

    // Update factura
    await db.factura.update({
      where: { id: facturaId },
      data: {
        estado: "PROCESADA",
        tipo,
        numeroFactura: ocrData.numero_factura,
        fechaFactura,
        emisorCif: ocrData.emisor_cif,
        emisorNombre: ocrData.emisor_nombre,
        receptorCif: ocrData.receptor_cif,
        receptorNombre: ocrData.receptor_nombre,
        baseImponible: ocrData.base_imponible ?? undefined,
        ivaPorcentaje: ocrData.iva_porcentaje ?? undefined,
        ivaImporte: ocrData.iva_importe ?? undefined,
        total: ocrData.total ?? undefined,
        concepto: ocrData.concepto,
        trimestre: fechaFactura ? calcTrimestre(fechaFactura) : null,
        año: fechaFactura ? calcAño(fechaFactura) : null,
      },
    });

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
      });
    }

    // Upsert proveedor (the party that is NOT our empresa)
    const proveedorCif = tipo === "INGRESO" ? ocrData.receptor_cif : ocrData.emisor_cif;
    const proveedorNombre = tipo === "INGRESO" ? ocrData.receptor_nombre : ocrData.emisor_nombre;

    if (proveedorCif && proveedorNombre && proveedorCif !== factura.empresa.cif) {
      await upsertProveedor(factura.empresaId, {
        cif: proveedorCif,
        nombre: proveedorNombre,
        importe: ocrData.total ?? 0,
      });
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Error desconocido";
    await db.factura.update({
      where: { id: facturaId },
      data: { estado: "ERROR", errorMensaje: message.substring(0, 500) },
    });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
