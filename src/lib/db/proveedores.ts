import { db } from "./client";
import type { ProveedorRow } from "@/types";

export async function listProveedores(empresaId: string): Promise<ProveedorRow[]> {
  return db.proveedor.findMany({
    where: { empresaId },
    orderBy: { totalImporte: "desc" },
    select: {
      id: true,
      empresaId: true,
      cif: true,
      nombre: true,
      email: true,
      telefono: true,
      totalFacturas: true,
      totalImporte: true,
      createdAt: true,
      updatedAt: true,
    },
  }) as unknown as ProveedorRow[];
}

export async function upsertProveedor(
  empresaId: string,
  data: {
    cif: string;
    nombre: string;
    importe: number;
  }
): Promise<void> {
  const existing = await db.proveedor.findUnique({
    where: { empresaId_cif: { empresaId, cif: data.cif } },
  });

  if (existing) {
    await db.proveedor.update({
      where: { id: existing.id },
      data: {
        totalFacturas: { increment: 1 },
        totalImporte: { increment: data.importe },
        nombre: data.nombre,
      },
    });
  } else {
    await db.proveedor.create({
      data: {
        empresaId,
        cif: data.cif,
        nombre: data.nombre,
        totalFacturas: 1,
        totalImporte: data.importe,
      },
    });
  }
}
