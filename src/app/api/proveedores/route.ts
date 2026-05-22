import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { listProveedores } from "@/lib/db/proveedores";
import { getEmpresaByCif } from "@/lib/db/empresas";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  let empresaId: string;

  if (session.user.role === "CLIENTE") {
    if (!session.user.empresaId) return NextResponse.json({ error: "Sin empresa" }, { status: 403 });
    empresaId = session.user.empresaId;
  } else {
    const url = new URL(req.url);
    const cif = url.searchParams.get("cif");
    if (!cif) return NextResponse.json({ error: "cif requerido" }, { status: 400 });
    const empresa = await getEmpresaByCif(cif);
    if (!empresa) return NextResponse.json({ error: "Empresa no encontrada" }, { status: 404 });
    empresaId = empresa.id;
  }

  const proveedores = await listProveedores(empresaId);
  return NextResponse.json(proveedores);
}
