import { createClient } from "@supabase/supabase-js"
import { randomUUID } from "crypto"
import path from "path"

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

export async function uploadFactura(
  file: File,
  empresaId: string
): Promise<{ url: string; path: string }> {
  const supabase = getSupabaseAdmin()
  const ext = path.extname(file.name).toLowerCase()
  const filePath = `facturas/${empresaId}/${randomUUID()}${ext}`

  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await supabase.storage
    .from("facturas")
    .upload(filePath, buffer, {
      contentType: file.type,
      upsert: false,
    })

  if (error) throw new Error(`Error al subir archivo: ${error.message}`)

  const { data } = supabase.storage.from("facturas").getPublicUrl(filePath)
  return { url: data.publicUrl, path: filePath }
}
