import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { getEmpresaByCif, updateEmpresa, toggleEmpresaActivo } from "@/lib/db/empresas"
import { z } from "zod"

const UpdateSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().optional().nullable(),
  telefono: z.string().optional().nullable(),
  direccion: z.string().optional().nullable(),
  password: z.string().min(8).optional(),
})

interface Params { params: Promise<{ cif: string }> }

export async function GET(_req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  const { cif } = await params
  const empresa = await getEmpresaByCif(cif)
  if (!empresa) return NextResponse.json({ error: "No encontrada" }, { status: 404 })
  return NextResponse.json(empresa)
}

export async function PUT(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  const { cif } = await params
  const body = await req.json() as unknown
  const parsed = UpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }
  const empresa = await updateEmpresa(cif, {
    nombre: parsed.data.nombre,
    email: parsed.data.email ?? undefined,
    telefono: parsed.data.telefono ?? undefined,
    direccion: parsed.data.direccion ?? undefined,
    password: parsed.data.password,
  })
  return NextResponse.json(empresa)
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  const { cif } = await params
  const body = await req.json() as { activo?: boolean }
  const activo = body.activo ?? false
  const empresa = await toggleEmpresaActivo(cif, activo)
  return NextResponse.json(empresa)
}
