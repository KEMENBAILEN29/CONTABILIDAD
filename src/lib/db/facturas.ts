import { db } from "./client"
import type { FiltrosFactura, TipoFactura, EstadoFactura } from "@/types"

export async function listFacturas(empresaId: string, filtros: FiltrosFactura = {}) {
  return db.factura.findMany({
    where: {
      empresaId,
      ...(filtros.tipo ? { tipo: filtros.tipo } : {}),
      ...(filtros.estado ? { estado: filtros.estado } : {}),
      ...(filtros.desde || filtros.hasta
        ? {
            fechaFactura: {
              ...(filtros.desde ? { gte: new Date(filtros.desde) } : {}),
              ...(filtros.hasta ? { lte: new Date(filtros.hasta) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { lineas: true },
  })
}

export async function getFactura(id: string) {
  return db.factura.findUnique({
    where: { id },
    include: { lineas: true, empresa: { select: { cif: true, nombre: true } } },
  })
}

export async function createFactura(data: {
  empresaId: string
  archivoUrl: string
  archivoNombre: string
  subidoPorAdmin?: boolean
}) {
  return db.factura.create({
    data: {
      empresaId: data.empresaId,
      archivoUrl: data.archivoUrl,
      archivoNombre: data.archivoNombre,
      subidoPorAdmin: data.subidoPorAdmin ?? false,
      estado: "PROCESANDO",
    },
  })
}

export async function updateFactura(
  id: string,
  data: {
    tipo?: TipoFactura
    estado?: EstadoFactura
    errorMensaje?: string
    numeroFactura?: string
    fechaFactura?: Date
    emisorCif?: string
    emisorNombre?: string
    receptorCif?: string
    receptorNombre?: string
    baseImponible?: number
    ivaPorcentaje?: number
    ivaImporte?: number
    total?: number
    concepto?: string
    trimestre?: number
    anio?: number
  }
) {
  return db.factura.update({ where: { id }, data })
}

export async function deleteFactura(id: string) {
  return db.factura.delete({ where: { id } })
}

export async function getResumenDashboard(empresaId: string) {
  const [ingresos, gastos, pendientes] = await Promise.all([
    db.factura.aggregate({
      where: { empresaId, tipo: "INGRESO", estado: "PROCESADA" },
      _sum: { total: true },
    }),
    db.factura.aggregate({
      where: { empresaId, tipo: "GASTO", estado: "PROCESADA" },
      _sum: { total: true },
    }),
    db.factura.count({ where: { empresaId, estado: "PROCESANDO" } }),
  ])

  const totalIngresos = Number(ingresos._sum.total ?? 0)
  const totalGastos = Number(gastos._sum.total ?? 0)

  return {
    totalIngresos,
    totalGastos,
    balance: totalIngresos - totalGastos,
    facturasPendientes: pendientes,
  }
}

export async function getDatosMensuales(empresaId: string, anio: number) {
  const desde = new Date(`${anio}-01-01`)
  const hasta = new Date(`${anio}-12-31`)

  const facturas = await db.factura.findMany({
    where: {
      empresaId,
      estado: "PROCESADA",
      fechaFactura: { gte: desde, lte: hasta },
      tipo: { in: ["INGRESO", "GASTO"] },
    },
    select: { tipo: true, total: true, fechaFactura: true },
  })

  const meses: Record<number, { ingresos: number; gastos: number }> = {}
  for (let i = 1; i <= 12; i++) meses[i] = { ingresos: 0, gastos: 0 }

  for (const f of facturas) {
    if (!f.fechaFactura || !f.total) continue
    const mes = f.fechaFactura.getMonth() + 1
    const val = Number(f.total)
    if (f.tipo === "INGRESO") meses[mes].ingresos += val
    else if (f.tipo === "GASTO") meses[mes].gastos += val
  }

  return Object.entries(meses).map(([mes, datos]) => ({
    mes: Number(mes),
    ...datos,
  }))
}

export async function getFacturasRango(empresaId: string, desde: Date, hasta: Date) {
  return db.factura.findMany({
    where: { empresaId, estado: "PROCESADA", fechaFactura: { gte: desde, lte: hasta } },
    include: { lineas: true },
    orderBy: { fechaFactura: "asc" },
  })
}
