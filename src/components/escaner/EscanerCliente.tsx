"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"
import { ProcesandoSpinner } from "@/components/escaner/ProcesandoSpinner"
import { FacturaEscanResult } from "@/components/escaner/FacturaEscanResult"
import type { FacturaConLineas } from "@/types"

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024

type Estado =
  | { fase: "idle" }
  | { fase: "uploading" }
  | { fase: "processing"; facturaId: string; poll: number }
  | { fase: "done"; factura: FacturaConLineas }
  | { fase: "error"; mensaje: string }

interface EscanerClienteProps {
  empresaId: string
}

export function EscanerCliente({ empresaId }: EscanerClienteProps) {
  const router = useRouter()
  const [estado, setEstado] = useState<Estado>({ fase: "idle" })
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [fileError, setFileError] = useState<string | null>(null)

  const validate = (f: File): string | null => {
    if (!ACCEPTED.includes(f.type)) return "Formato no soportado. Use PDF, JPG, PNG o WEBP."
    if (f.size > MAX_SIZE) return "El archivo supera el límite de 10MB."
    return null
  }

  const handleFile = (f: File) => {
    const err = validate(f)
    if (err) { setFileError(err); return }
    setFileError(null)
    setFile(f)
  }

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }, [])

  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true) }
  const onDragLeave = () => setDragging(false)

  const pollUntilDone = async (facturaId: string): Promise<FacturaConLineas> => {
    const MAX_POLLS = 30
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise<void>((r) => setTimeout(r, 3000))
      const res = await fetch(`/api/facturas/${facturaId}`)
      if (!res.ok) throw new Error("Error consultando el estado de la factura")
      const data = await res.json() as FacturaConLineas
      setEstado({ fase: "processing", facturaId, poll: i + 1 })
      if (data.estado === "PROCESADA") return data
      if (data.estado === "ERROR") throw new Error(data.errorMensaje ?? "Error en el procesamiento OCR")
    }
    throw new Error("Tiempo de espera agotado. La factura puede seguir procesándose en segundo plano.")
  }

  const escanear = async () => {
    if (!file) return
    setEstado({ fase: "uploading" })
    setFileError(null)

    try {
      const form = new FormData()
      form.append("file", file)
      form.append("empresaId", empresaId)

      const res = await fetch("/api/facturas/upload", { method: "POST", body: form })
      const data = await res.json() as { facturaId?: string; error?: string }
      if (!res.ok) throw new Error(data.error ?? "Error al subir la factura")

      setEstado({ fase: "processing", facturaId: data.facturaId!, poll: 0 })
      const factura = await pollUntilDone(data.facturaId!)
      setEstado({ fase: "done", factura })
    } catch (e) {
      setEstado({ fase: "error", mensaje: e instanceof Error ? e.message : "Error desconocido" })
    }
  }

  const reset = () => {
    setEstado({ fase: "idle" })
    setFile(null)
    setFileError(null)
  }

  if (estado.fase === "processing") {
    return (
      <div className="rounded-lg border border-[#E2E8F0] bg-white">
        <ProcesandoSpinner poll={estado.poll} />
      </div>
    )
  }

  if (estado.fase === "done") {
    return (
      <FacturaEscanResult
        factura={estado.factura}
        onGuardar={() => router.push("/facturas")}
        onEscanearOtra={reset}
      />
    )
  }

  if (estado.fase === "error") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm font-medium text-[#DC2626] mb-1">Error al procesar la factura</p>
        <p className="text-sm text-[#64748B] mb-4">{estado.mensaje}</p>
        <Button variant="outline" onClick={reset}>Intentar de nuevo</Button>
      </div>
    )
  }

  return (
    <div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-10 transition-colors ${
          dragging ? "border-[#2563EB] bg-blue-50" : "border-[#E2E8F0] bg-[#F8FAFC] hover:border-[#2563EB]"
        }`}
      >
        {file ? (
          <div className="flex items-center gap-3">
            <FileText className="h-8 w-8 text-[#2563EB]" />
            <div>
              <p className="text-sm font-medium text-[#0F172A]">{file.name}</p>
              <p className="text-xs text-[#64748B]">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            <button onClick={() => setFile(null)} className="ml-2 text-[#64748B] hover:text-[#DC2626]">
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Upload className="mb-3 h-10 w-10 text-[#64748B]" />
            <p className="text-sm font-medium text-[#0F172A]">Arrastra tu factura aquí</p>
            <p className="mt-1 text-xs text-[#64748B]">PDF, JPG, PNG, WEBP — máx. 10MB</p>
            <label className="mt-4 cursor-pointer">
              <span className="rounded-sm bg-[#2563EB] px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors">
                Seleccionar archivo
              </span>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                className="sr-only"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
              />
            </label>
          </>
        )}
      </div>

      {fileError && <p className="mt-2 text-sm text-[#DC2626]">{fileError}</p>}

      {file && (
        <div className="mt-4 flex items-center gap-3">
          <Button
            onClick={escanear}
            disabled={estado.fase === "uploading"}
            className="gap-2 bg-[#2563EB] hover:bg-blue-700"
          >
            {estado.fase === "uploading" && <LoadingSpinner className="h-4 w-4" />}
            {estado.fase === "uploading" ? "Subiendo..." : "Escanear con IA"}
          </Button>
          <Button variant="outline" onClick={() => setFile(null)}>
            Cancelar
          </Button>
        </div>
      )}
    </div>
  )
}
