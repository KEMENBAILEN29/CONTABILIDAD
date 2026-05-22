import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import path from "path";

function getSupabaseClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }

  return createClient(supabaseUrl, supabaseKey);
}

export async function uploadFactura(
  buffer: Buffer,
  originalName: string,
  empresaId: string,
  mimeType: string
): Promise<string> {
  const ext = path.extname(originalName) || ".pdf";
  const uuid = randomUUID();
  const filePath = `facturas/${empresaId}/${uuid}${ext}`;

  const supabase = getSupabaseClient();
  const { error } = await supabase.storage
    .from("facturas")
    .upload(filePath, buffer, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) {
    throw new Error(`Storage upload failed: ${error.message}`);
  }

  return filePath;
}

export async function downloadFactura(filePath: string): Promise<Buffer> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.storage.from("facturas").download(filePath);

  if (error || !data) {
    throw new Error(`Storage download failed: ${error?.message ?? "No data"}`);
  }

  return Buffer.from(await data.arrayBuffer());
}
