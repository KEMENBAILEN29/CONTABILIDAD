import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { auth } from "@/lib/auth/auth";
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
  // Only authenticated sessions or internal loopback calls are allowed.
  // This route is called internally from the upload route (same server),
  // so we accept calls that carry a valid session OR come from loopback.
  const session = await auth();
  const forwardedFor = req.headers.get("x-forwarded-for");
  const isLoopback =
    !forwardedFor &&
    (req.headers.get("host")?.startsWith("localhost") ||
      req.headers.get("host")?.startsWith("127."));

  if (!session && !isLoopback) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const body = (await req.json()) as { facturaId?: string };
  const { facturaId } = body;

  if (!facturaId) return NextResponse.json({ error: "facturaId requerido" }, { status: 400 });

  const factura = await db.factura.findUnique({
    where: { id: facturaId },
    include: { empresa: true },
  });

  if (!factura) return NextResponse.json({ error: "Factura no encontrada" }, { status: 404 });

  // If called with a session, verify the caller owns this factura
  if (session) {
    const isOwner =
      session.user.role === "ADMIN" ||
      session.user.empresaId === factura.empresaId;
    if (!isOwner) {
      return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
    }
  }

  // Idempotency guard — don't reprocess an already-completed factura
  if (factura.estado !== "PROCESANDO") {
    return NextResponse.json({ skipped: true, estado: factura.estado });
  }

  try {
    const fileBuffer = await downloadFactura(factura.archivoUrl);
    const mimeType = getMimeFromPath(factura.archivoUrl);

    const rawJson = await extractFromInvoice(fileBuffer, mimeType);
    const ocrData = parseOCRResult(rawJson);

    const tipo = classifyFactura(
      ocrData.emisor_cif,
      ocrData.receptor_cif,
      factura.empresa.cif
    );

    const fechaFactura = ocrData.fecha_factura ? new Date(ocrData.fecha_factura) : null;

    await db.factura.update({
      where: { id: facturaId, estado: "PROCESANDO" }, // optimistic lock
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
