import { db } from "./client";
import type { FacturaRow, FacturaConLineas, TipoFactura, EstadoFactura } from "@/types";

export interface FacturaFilters {
  tipo?: TipoFactura;
  estado?: EstadoFactura;
  desde?: string;
  hasta?: string;
}

export async function listFacturas(
  empresaId: string,
  filters: FacturaFilters = {}
): Promise<FacturaRow[]> {
  return db.factura.findMany({
    where: {
      empresaId,
      ...(filters.tipo ? { tipo: filters.tipo } : {}),
      ...(filters.estado ? { estado: filters.estado } : {}),
      ...(filters.desde || filters.hasta
        ? {
            fechaFactura: {
              ...(filters.desde ? { gte: new Date(filters.desde) } : {}),
              ...(filters.hasta ? { lte: new Date(filters.hasta) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      empresaId: true,
      archivoUrl: true,
      archivoNombre: true,
      tipo: true,
      estado: true,
      errorMensaje: true,
      numeroFactura: true,
      fechaFactura: true,
      emisorCif: true,
      emisorNombre: true,
      receptorCif: true,
      receptorNombre: true,
      baseImponible: true,
      ivaPorcentaje: true,
      ivaImporte: true,
      total: true,
      concepto: true,
      trimestre: true,
      año: true,
      subidoPorAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  }) as unknown as FacturaRow[];
}

export async function getFactura(id: string): Promise<FacturaConLineas | null> {
  const factura = await db.factura.findUnique({
    where: { id },
    include: { lineas: true },
  });
  return factura as unknown as FacturaConLineas | null;
}

export async function updateFactura(
  id: string,
  empresaId: string,
  data: Partial<{
    numeroFactura: string;
    fechaFactura: Date;
    emisorCif: string;
    emisorNombre: string;
    receptorCif: string;
    receptorNombre: string;
    baseImponible: number;
    ivaPorcentaje: number;
    ivaImporte: number;
    total: number;
    concepto: string;
    tipo: TipoFactura;
  }>
): Promise<FacturaRow | null> {
  const existing = await db.factura.findFirst({ where: { id, empresaId } });
  if (!existing) return null;
  return db.factura.update({
    where: { id },
    data,
  }) as unknown as FacturaRow;
}

export async function deleteFactura(id: string, empresaId: string): Promise<boolean> {
  const existing = await db.factura.findFirst({ where: { id, empresaId } });
  if (!existing) return false;
  await db.factura.delete({ where: { id } });
  return true;
}

export async function getDashboardStats(empresaId: string) {
  const currentYear = new Date().getFullYear();

  const [ingresos, gastos, pendientes] = await Promise.all([
    db.factura.aggregate({
      where: { empresaId, tipo: "INGRESO", estado: "PROCESADA", año: currentYear },
      _sum: { total: true },
    }),
    db.factura.aggregate({
      where: { empresaId, tipo: "GASTO", estado: "PROCESADA", año: currentYear },
      _sum: { total: true },
    }),
    db.factura.count({
      where: { empresaId, estado: "PROCESANDO" },
    }),
  ]);

  const totalIngresos = Number(ingresos._sum.total ?? 0);
  const totalGastos = Number(gastos._sum.total ?? 0);

  return {
    totalIngresos,
    totalGastos,
    balanceNeto: totalIngresos - totalGastos,
    facturasPendientes: pendientes,
  };
}

export async function getMensualData(empresaId: string, year: number) {
  const meses = [
    "Ene", "Feb", "Mar", "Abr", "May", "Jun",
    "Jul", "Ago", "Sep", "Oct", "Nov", "Dic",
  ];

  const facturas = await db.factura.findMany({
    where: { empresaId, estado: "PROCESADA", año: year, tipo: { in: ["INGRESO", "GASTO"] } },
    select: { tipo: true, total: true, fechaFactura: true },
  });

  const data = meses.map((mes, i) => {
    const monthFacturas = facturas.filter(
      (f) => f.fechaFactura && f.fechaFactura.getMonth() === i
    );
    const ingresos = monthFacturas
      .filter((f) => f.tipo === "INGRESO")
      .reduce((sum, f) => sum + Number(f.total ?? 0), 0);
    const gastos = monthFacturas
      .filter((f) => f.tipo === "GASTO")
      .reduce((sum, f) => sum + Number(f.total ?? 0), 0);
    return { mes, ingresos, gastos };
  });

  return data;
}

export async function getUltimasFacturas(empresaId: string, limit = 5): Promise<FacturaRow[]> {
  return db.factura.findMany({
    where: { empresaId },
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      empresaId: true,
      archivoUrl: true,
      archivoNombre: true,
      tipo: true,
      estado: true,
      errorMensaje: true,
      numeroFactura: true,
      fechaFactura: true,
      emisorCif: true,
      emisorNombre: true,
      receptorCif: true,
      receptorNombre: true,
      baseImponible: true,
      ivaPorcentaje: true,
      ivaImporte: true,
      total: true,
      concepto: true,
      trimestre: true,
      año: true,
      subidoPorAdmin: true,
      createdAt: true,
      updatedAt: true,
    },
  }) as unknown as FacturaRow[];
}

export async function getFacturasForInforme(
  empresaId: string,
  desde: Date,
  hasta: Date,
  tipo?: TipoFactura
) {
  return db.factura.findMany({
    where: {
      empresaId,
      estado: "PROCESADA",
      fechaFactura: { gte: desde, lte: hasta },
      ...(tipo ? { tipo } : {}),
    },
    include: { lineas: true },
    orderBy: { fechaFactura: "asc" },
  });
}
