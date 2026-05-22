import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getEmpresaByCif, updateEmpresa, toggleEmpresaActivo } from "@/lib/db/empresas";
import { z } from "zod";

const UpdateEmpresaSchema = z.object({
  nombre: z.string().min(1).optional(),
  email: z.string().email().nullable().optional(),
  telefono: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
  password: z.string().min(8).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ cif: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { cif } = await params;
  const empresa = await getEmpresaByCif(cif);
  if (!empresa) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json(empresa);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ cif: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { cif } = await params;
  const empresa = await getEmpresaByCif(cif);
  if (!empresa) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  const body = await req.json();
  const parsed = UpdateEmpresaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
  }

  const updated = await updateEmpresa(empresa.id, parsed.data);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ cif: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const { cif } = await params;
  const empresa = await getEmpresaByCif(cif);
  if (!empresa) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  await toggleEmpresaActivo(empresa.id, !empresa.activo);
  return NextResponse.json({ success: true });
}
