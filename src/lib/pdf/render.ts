import { renderToBuffer } from "@react-pdf/renderer"
import type { ReactElement } from "react"

export async function renderPDF(component: ReactElement): Promise<Buffer> {
  const buffer = await renderToBuffer(component)
  return Buffer.from(buffer)
}
