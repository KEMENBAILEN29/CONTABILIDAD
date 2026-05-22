import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { getFactura } from "@/lib/db/facturas";
import { getSignedUrl } from "@/lib/storage/getUrl";
import { Header } from "@/components/shared/Header";
import { FacturaDetalle } from "@/components/facturas/FacturaDetalle";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function FacturaPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const { id } = await params;
  const factura = await getFactura(id);
  if (!factura) notFound();
  if (factura.empresaId !== session.user.empresaId) redirect("/facturas");

  let fileUrl: string | null = null;
  try {
    fileUrl = await getSignedUrl(factura.archivoUrl);
  } catch {
    // File URL not critical
  }

  return (
    <div>
      <Header title={factura.archivoNombre} description={`ID: ${factura.id}`}>
        <Link href="/facturas">
          <Button variant="ghost" size="sm">← Volver</Button>
        </Link>
      </Header>
      <FacturaDetalle factura={factura} fileUrl={fileUrl} />
    </div>
  );
}
