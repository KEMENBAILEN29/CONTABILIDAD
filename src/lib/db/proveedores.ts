import { db } from "./client"

export async function listProveedores(empresaId: string) {
  return db.proveedor.findMany({
    where: { empresaId },
    orderBy: { totalImporte: "desc" },
  })
}

export async function upsertProveedor(data: {
  empresaId: string
  cif: string
  nombre: string
  importe: number
}) {
  return db.proveedor.upsert({
    where: { empresaId_cif: { empresaId: data.empresaId, cif: data.cif } },
    create: {
      empresaId: data.empresaId,
      cif: data.cif,
      nombre: data.nombre,
      totalFacturas: 1,
      totalImporte: data.importe,
    },
    update: {
      nombre: data.nombre,
      totalFacturas: { increment: 1 },
      totalImporte: { increment: data.importe },
    },
  })
}
