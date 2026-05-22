import type { TipoFactura } from "@/types";

export function classifyFactura(
  emisorCif: string | null,
  receptorCif: string | null,
  empresaCif: string
): TipoFactura {
  const normalizedEmpresaCif = empresaCif.toUpperCase().trim();
  const normalizedEmisor = emisorCif?.toUpperCase().trim() ?? "";
  const normalizedReceptor = receptorCif?.toUpperCase().trim() ?? "";

  const isEmisor = normalizedEmisor === normalizedEmpresaCif;
  const isReceptor = normalizedReceptor === normalizedEmpresaCif;

  if (isEmisor && isReceptor) return "AMBAS";
  if (isEmisor) return "INGRESO";
  if (isReceptor) return "GASTO";

  // Default to GASTO if CIFs don't match (received invoice)
  return "GASTO";
}
