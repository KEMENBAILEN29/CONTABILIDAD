import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const SYSTEM_PROMPT = `Eres un sistema de extracción de datos contables. Analiza la imagen de la factura
y devuelve ÚNICAMENTE un JSON válido con esta estructura exacta (sin texto adicional):

{
  "numero_factura": string | null,
  "fecha_factura": "YYYY-MM-DD" | null,
  "emisor_cif": string | null,
  "emisor_nombre": string | null,
  "receptor_cif": string | null,
  "receptor_nombre": string | null,
  "base_imponible": number | null,
  "iva_porcentaje": number | null,
  "iva_importe": number | null,
  "total": number | null,
  "concepto": string | null,
  "lineas": [
    {
      "descripcion": string,
      "cantidad": number,
      "precio_unitario": number,
      "iva_porcentaje": number,
      "subtotal": number
    }
  ]
}

Reglas:
- Los CIF españoles tienen formato: letra + 7 dígitos + dígito/letra (ej: B12345678)
- Si un campo no está visible o no existe, usa null
- Los importes son números decimales con punto (no coma)
- Si no hay líneas detalladas, devuelve lineas: []`

export async function extractFromInvoice(
  fileBuffer: Buffer,
  mimeType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp"
): Promise<string> {
  const base64 = fileBuffer.toString("base64")

  const mediaTypeMap = {
    "application/pdf": "application/pdf",
    "image/jpeg": "image/jpeg",
    "image/png": "image/png",
    "image/webp": "image/webp",
  } as const

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: [
          {
            type: "document",
            source: {
              type: "base64",
              media_type: mediaTypeMap[mimeType],
              data: base64,
            },
          } as Anthropic.DocumentBlockParam,
          {
            type: "text",
            text: "Extrae todos los datos de esta factura y devuelve el JSON.",
          },
        ],
      },
    ],
  })

  const content = response.content[0]
  if (content.type !== "text") throw new Error("Respuesta inesperada de Claude")
  return content.text
}
