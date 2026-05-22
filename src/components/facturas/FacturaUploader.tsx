"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from "lucide-react";

type UploadState = "idle" | "uploading" | "polling" | "done" | "error";

interface FacturaUploaderProps {
  empresaId?: string;
}

export function FacturaUploader({ empresaId }: FacturaUploaderProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>("idle");
  const [error, setError] = useState("");
  const [fileName, setFileName] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  async function uploadFile(file: File) {
    setState("uploading");
    setFileName(file.name);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    if (empresaId) formData.append("empresaId", empresaId);

    try {
      const res = await fetch("/api/facturas/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Error al subir");
      }
      const { facturaId } = await res.json() as { facturaId: string };
      setState("polling");
      await pollFactura(facturaId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setState("error");
    }
  }

  async function pollFactura(facturaId: string) {
    const maxAttempts = 20;
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((r) => setTimeout(r, 3000));
      try {
        const res = await fetch(`/api/facturas/${facturaId}`);
        const data = await res.json() as { estado: string };
        if (data.estado === "PROCESADA") {
          setState("done");
          router.refresh();
          return;
        }
        if (data.estado === "ERROR") {
          setState("error");
          setError("Error al procesar la factura. Puedes editarla manualmente.");
          router.refresh();
          return;
        }
      } catch {
        // continue polling
      }
    }
    setState("error");
    setError("Tiempo de espera agotado. La factura se procesará en breve.");
    router.refresh();
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }

  const isProcessing = state === "uploading" || state === "polling";

  return (
    <Card>
      <CardContent className="p-4">
        {state === "done" && (
          <Alert variant="success" className="mb-4">
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>Factura procesada correctamente: {fileName}</AlertDescription>
          </Alert>
        )}
        {state === "error" && (
          <Alert variant="destructive" className="mb-4">
            <XCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          className={`relative flex flex-col items-center justify-center rounded-[8px] border-2 border-dashed p-8 transition-colors ${isDragging ? "border-[#2563EB] bg-blue-50" : "border-[#E2E8F0] hover:border-[#2563EB] hover:bg-slate-50"} ${isProcessing ? "pointer-events-none opacity-60" : "cursor-pointer"}`}
          onClick={() => !isProcessing && inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="hidden" />

          {isProcessing ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-[#2563EB]" />
              <p className="text-sm font-medium text-[#0F172A]">
                {state === "uploading" ? "Subiendo..." : "Procesando con IA..."}
              </p>
              <p className="text-xs text-[#64748B]">{fileName}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#F8FAFC]">
                {state === "done" ? (
                  <FileText className="h-6 w-6 text-[#16A34A]" />
                ) : (
                  <Upload className="h-6 w-6 text-[#64748B]" />
                )}
              </div>
              <p className="text-sm font-medium text-[#0F172A]">
                Arrastra una factura o haz clic para seleccionar
              </p>
              <p className="text-xs text-[#64748B]">PDF, JPG, PNG o WEBP · Máx. 10 MB</p>
              <Button variant="outline" size="sm" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                Seleccionar archivo
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
