import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { listFacturas } from "@/lib/db/facturas";
import { Header } from "@/components/shared/Header";
import { FacturaUploader } from "@/components/facturas/FacturaUploader";
import { FacturaTable } from "@/components/facturas/FacturaTable";
import type { TipoFactura, EstadoFactura } from "@/types";

interface SearchParams {
  tipo?: string;
  estado?: string;
  desde?: string;
  hasta?: string;
}

export default async function FacturasPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  const sp = await searchParams;
  const empresaId = session.user.empresaId!;

  const facturas = await listFacturas(empresaId, {
    tipo: sp.tipo as TipoFactura | undefined,
    estado: sp.estado as EstadoFactura | undefined,
    desde: sp.desde,
    hasta: sp.hasta,
  });

  return (
    <div>
      <Header title="Facturas" description="Gestiona y sube tus facturas" />
      <FacturaUploader />
      <div className="mt-6">
        <FacturaTable facturas={facturas} />
      </div>
    </div>
  );
}
