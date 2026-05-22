import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { listEmpresas, createEmpresa } from "@/lib/db/empresas";
import { z } from "zod";

const CreateEmpresaSchema = z.object({
  cif: z.string().regex(/^[A-Za-z]\d{7}[A-Za-z0-9]$/, "CIF inválido"),
  nombre: z.string().min(1),
  email: z.string().email().optional(),
  telefono: z.string().optional(),
  direccion: z.string().optional(),
  password: z.string().min(8, "Mínimo 8 caracteres"),
});

export async function GET() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }
  const empresas = await listEmpresas();
  return NextResponse.json(empresas);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = CreateEmpresaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
  }

  try {
    const empresa = await createEmpresa(parsed.data);
    return NextResponse.json(empresa, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique")) {
      return NextResponse.json({ error: "El CIF ya está registrado" }, { status: 409 });
    }
    return NextResponse.json({ error: "Error al crear empresa" }, { status: 500 });
  }
}
