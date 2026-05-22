import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { listEmpresas, createEmpresa } from "@/lib/db/empresas"
import { z } from "zod"

const CreateSchema = z.object({
  cif: z.string().regex(/^[A-Z][0-9]{7}[A-Z0-9]$/i, "CIF inválido"),
  nombre: z.string().min(1),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  password: z.string().min(8),
})

export async function GET() {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  const empresas = await listEmpresas()
  return NextResponse.json(empresas)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }

  const body = await req.json() as unknown
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 })
  }

  try {
    const empresa = await createEmpresa(parsed.data)
    return NextResponse.json(empresa, { status: 201 })
  } catch (e) {
    const msg = e instanceof Error && e.message.includes("Unique") ? "El CIF ya existe" : "Error al crear empresa"
    return NextResponse.json({ error: msg }, { status: 409 })
  }
}
