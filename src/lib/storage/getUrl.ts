import { createClient } from "@supabase/supabase-js";

export async function getSignedUrl(filePath: string, expiresIn = 3600): Promise<string> {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase credentials not configured");
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  const { data, error } = await supabase.storage
    .from("facturas")
    .createSignedUrl(filePath, expiresIn);

  if (error || !data) {
    throw new Error(`Failed to create signed URL: ${error?.message ?? "No data"}`);
  }

  return data.signedUrl;
}
