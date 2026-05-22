import { NextResponse } from "next/server"
import { auth } from "@/lib/auth/auth"
import { listProveedores } from "@/lib/db/proveedores"

export async function GET() {
  const session = await auth()
  if (!session || !session.user.empresaId) {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 })
  }
  const proveedores = await listProveedores(session.user.empresaId)
  return NextResponse.json(proveedores)
}
