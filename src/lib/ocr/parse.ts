import { z } from "zod";
import type { OCRResult } from "@/types";

const OCRLineaSchema = z.object({
  descripcion: z.string(),
  cantidad: z.number(),
  precio_unitario: z.number(),
  iva_porcentaje: z.number(),
  subtotal: z.number(),
});

const OCRResultSchema = z.object({
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
  lineas: z.array(OCRLineaSchema).default([]),
});

export function parseOCRResult(rawJson: string): OCRResult {
  const cleaned = rawJson
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error(`Invalid JSON from OCR: ${cleaned.substring(0, 200)}`);
  }

  const result = OCRResultSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`OCR result validation failed: ${result.error.message}`);
  }

  return result.data;
}
