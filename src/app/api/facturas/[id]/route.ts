import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getFactura, updateFactura, deleteFactura } from "@/lib/db/facturas";
import { z } from "zod";

const UpdateFacturaSchema = z.object({
  numeroFactura: z.string().optional(),
  fechaFactura: z.string().optional(),
  emisorCif: z.string().optional(),
  emisorNombre: z.string().optional(),
  receptorCif: z.string().optional(),
  receptorNombre: z.string().optional(),
  baseImponible: z.number().optional(),
  ivaPorcentaje: z.number().optional(),
  ivaImporte: z.number().optional(),
  total: z.number().optional(),
  concepto: z.string().optional(),
  tipo: z.enum(["INGRESO", "GASTO", "AMBAS"]).optional(),
});

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const factura = await getFactura(id);
  if (!factura) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  // Verify ownership
  if (session.user.role === "CLIENTE" && factura.empresaId !== session.user.empresaId) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  return NextResponse.json(factura);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const factura = await getFactura(id);
  if (!factura) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  if (session.user.role === "CLIENTE" && factura.empresaId !== session.user.empresaId) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = UpdateFacturaSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Validation error" }, { status: 400 });
  }

  const empresaId = session.user.role === "CLIENTE" ? session.user.empresaId! : factura.empresaId;
  const data = {
    ...parsed.data,
    fechaFactura: parsed.data.fechaFactura ? new Date(parsed.data.fechaFactura) : undefined,
  };

  const updated = await updateFactura(id, empresaId, data);
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { id } = await params;
  const factura = await getFactura(id);
  if (!factura) return NextResponse.json({ error: "No encontrada" }, { status: 404 });

  if (session.user.role === "CLIENTE" && factura.empresaId !== session.user.empresaId) {
    return NextResponse.json({ error: "Sin permiso" }, { status: 403 });
  }

  const empresaId = session.user.role === "CLIENTE" ? session.user.empresaId! : factura.empresaId;
  const deleted = await deleteFactura(id, empresaId);
  if (!deleted) return NextResponse.json({ error: "No encontrada" }, { status: 404 });
  return NextResponse.json({ success: true });
}
