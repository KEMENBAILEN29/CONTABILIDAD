import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { uploadFactura } from "@/lib/storage/upload"
import { createFactura } from "@/lib/db/facturas"
import { db } from "@/lib/db/client"

const ALLOWED_MIME = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024

// Rate limit: max 20 uploads per hour per empresa
const uploadCounts = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(empresaId: string): boolean {
  const now = Date.now()
  const entry = uploadCounts.get(empresaId)
  if (!entry || now > entry.resetAt) {
    uploadCounts.set(empresaId, { count: 1, resetAt: now + 60 * 60 * 1000 })
    return true
  }
  if (entry.count >= 20) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  const empresaIdParam = formData.get("empresaId") as string | null

  if (!file) return NextResponse.json({ error: "No se recibió archivo" }, { status: 400 })

  if (!ALLOWED_MIME.includes(file.type)) {
    return NextResponse.json({ error: "Formato no soportado. Use PDF, JPG, PNG o WEBP." }, { status: 400 })
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Archivo demasiado grande (máx 10MB)" }, { status: 400 })
  }

  let empresaId: string
  if (session.user.role === "ADMIN") {
    if (!empresaIdParam) return NextResponse.json({ error: "Se requiere empresaId" }, { status: 400 })
    // Verify empresa exists
    const empresa = await db.empresa.findUnique({ where: { id: empresaIdParam } })
    if (!empresa) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 })
    empresaId = empresaIdParam
  } else {
    if (!session.user.empresaId) return NextResponse.json({ error: "Sin empresa asociada" }, { status: 403 })
    empresaId = session.user.empresaId
  }

  if (!checkRateLimit(empresaId)) {
    return NextResponse.json({ error: "Límite de 20 facturas/hora alcanzado" }, { status: 429 })
  }

  const { url } = await uploadFactura(file, empresaId)
  const factura = await createFactura({
    empresaId,
    archivoUrl: url,
    archivoNombre: file.name,
    subidoPorAdmin: session.user.role === "ADMIN",
  })

  // Fire-and-forget OCR processing
  void fetch(`${req.nextUrl.origin}/api/facturas/process`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ facturaId: factura.id }),
  }).catch(console.error)

  return NextResponse.json({ facturaId: factura.id, estado: "PROCESANDO" })
}
