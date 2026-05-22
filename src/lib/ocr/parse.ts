import { z } from "zod"
import type { OCRResult } from "@/types"

const LineaSchema = z.object({
  descripcion: z.string(),
  cantidad: z.number(),
  precio_unitario: z.number(),
  iva_porcentaje: z.number(),
  subtotal: z.number(),
})

const OCRSchema = z.object({
  numero_factura: z.string().nullable(),
  fecha_factura: z.string().nullable(),
  emisor_cif: z.string().nullable(),
  emisor_nombre: z.string().nullable(),
  receptor_cif: z.string().nullable(),
  receptor_nombre: z.string().nullable(),
  base_imponible: z.number().nullable(),
  iva_porcentaje: z.number().nullable(),
  iva_importe: z.number().nullable(),
  total: z.number().nullable(),
  concepto: z.string().nullable(),
  lineas: z.array(LineaSchema).default([]),
})

export function parseOCRResult(raw: string): OCRResult {
  const cleaned = raw
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim()

  const parsed = JSON.parse(cleaned) as unknown
  const result = OCRSchema.parse(parsed)
  return result
}
