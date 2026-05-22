import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db/client";
import { uploadFactura } from "@/lib/storage/upload";

const ALLOWED_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// Simple in-memory rate limiter (per empresaId, per hour)
const uploadCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(empresaId: string): boolean {
  const now = Date.now();
  const record = uploadCounts.get(empresaId);
  if (!record || record.resetAt < now) {
    uploadCounts.set(empresaId, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (record.count >= 20) return false;
  record.count += 1;
  return true;
}

async function processFacturaAsync(facturaId: string, baseUrl: string) {
  try {
    await fetch(`${baseUrl}/api/facturas/process`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ facturaId }),
    });
  } catch {
    // Background process — errors handled inside process route
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const empresaIdParam = formData.get("empresaId") as string | null;

  if (!file) return NextResponse.json({ error: "Archivo requerido" }, { status: 400 });

  // Determine empresaId
  let empresaId: string;
  if (session.user.role === "ADMIN") {
    if (!empresaIdParam) return NextResponse.json({ error: "empresaId requerido para admin" }, { status: 400 });
    const empresa = await db.empresa.findUnique({ where: { id: empresaIdParam } });
    if (!empresa) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    empresaId = empresa.id;
  } else {
    if (!session.user.empresaId) return NextResponse.json({ error: "Sin empresa asociada" }, { status: 403 });
    empresaId = session.user.empresaId;
  }

  // Rate limiting
  if (!checkRateLimit(empresaId)) {
    return NextResponse.json({ error: "Límite de subidas alcanzado (20/hora)" }, { status: 429 });
  }

  // Validate MIME type
  const mimeType = file.type as AllowedMimeType;
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: "Formato no soportado. Use PDF, JPG, PNG o WEBP" }, { status: 400 });
  }

  // Validate size
  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Archivo demasiado grande (máximo 10MB)" }, { status: 400 });
  }

  // Upload to storage
  const buffer = Buffer.from(await file.arrayBuffer());
  const filePath = await uploadFactura(buffer, file.name, empresaId, mimeType);

  // Create DB record
  const factura = await db.factura.create({
    data: {
      empresaId,
      archivoUrl: filePath,
      archivoNombre: file.name,
      estado: "PROCESANDO",
      subidoPorAdmin: session.user.role === "ADMIN",
    },
  });

  // Launch OCR async
  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  void processFacturaAsync(factura.id, baseUrl);

  return NextResponse.json({ facturaId: factura.id, estado: "PROCESANDO" });
}
