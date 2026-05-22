import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { getFactura, updateFactura, deleteFactura } from "@/lib/db/facturas"
import { z } from "zod"

interface Params { params: Promise<{ id: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const factura = await getFactura(id)
  if (!factura) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  if (session.user.role === "CLIENTE" && factura.empresaId !== session.user.empresaId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  return NextResponse.json(factura)
}

const UpdateSchema = z.object({
  numeroFactura: z.string().optional(),
  emisorCif: z.string().optional(),
  emisorNombre: z.string().optional(),
  receptorCif: z.string().optional(),
  receptorNombre: z.string().optional(),
  baseImponible: z.coerce.number().optional(),
  ivaPorcentaje: z.coerce.number().optional(),
  ivaImporte: z.coerce.number().optional(),
  total: z.coerce.number().optional(),
  concepto: z.string().optional(),
})

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const factura = await getFactura(id)
  if (!factura) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  if (session.user.role === "CLIENTE" && factura.empresaId !== session.user.empresaId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await req.json() as unknown
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const updated = await updateFactura(id, parsed.data)
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { id } = await params
  const factura = await getFactura(id)
  if (!factura) return NextResponse.json({ error: "No encontrada" }, { status: 404 })

  if (session.user.role === "CLIENTE" && factura.empresaId !== session.user.empresaId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  await deleteFactura(id)
  return NextResponse.json({ ok: true })
}
