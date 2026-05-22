import { createClient } from "@supabase/supabase-js"

function getSupabaseAdmin() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
  const supabase = getSupabaseAdmin()
  const bucketPath = filePath.startsWith("facturas/") ? filePath : `facturas/${filePath}`

  const { data, error } = await supabase.storage
    .from("facturas")
    .createSignedUrl(bucketPath, expiresIn)

  if (error || !data) throw new Error(`Error al generar URL firmada: ${error?.message}`)
  return data.signedUrl
}
