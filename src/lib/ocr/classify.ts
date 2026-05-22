import type { TipoFactura } from "@/types"

export function classifyFactura(
  emisorCif: string | null,
  receptorCif: string | null,
  empresaCif: string
): TipoFactura {
  const empresa = empresaCif.toUpperCase()
  const emisor = emisorCif?.toUpperCase()
  const receptor = receptorCif?.toUpperCase()

  const esEmisor = emisor === empresa
  const esReceptor = receptor === empresa

  if (esEmisor && esReceptor) return "AMBAS"
  if (esEmisor) return "INGRESO"
  if (esReceptor) return "GASTO"

  // Sin CIF coincidente: asumimos gasto (factura recibida)
  return "GASTO"
}
