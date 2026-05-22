import { renderToBuffer } from "@react-pdf/renderer";
import type { ReactElement } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function renderPDF(component: ReactElement<any>): Promise<Blob> {
  const buffer = await renderToBuffer(component);
  // Copy to a plain ArrayBuffer to satisfy TypeScript's strict Buffer types
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  ) as ArrayBuffer;
  return new Blob([arrayBuffer], { type: "application/pdf" });
}
