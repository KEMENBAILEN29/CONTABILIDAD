"use client"

import { useCallback, useState } from "react"
import { useRouter } from "next/navigation"
import { Upload, FileText, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

const ACCEPTED = ["application/pdf", "image/jpeg", "image/png", "image/webp"]
const MAX_SIZE = 10 * 1024 * 1024 // 10MB

interface FacturaUploaderProps {
  empresaId?: string
}

export function FacturaUploader({ empresaId }: FacturaUploaderProps) {
  const router = useRouter()
  const [dragging, setDragging] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string | null>(null)

  const validate = (f: File): string | null => {
    if (!ACCEPTED.includes(f.type)) return "Formato no soportado. Use PDF, JPG, PNG o WEBP."
    if (f.size > MAX_SIZE) return "El archivo supera el límite de 10MB."
    return null
  }

  const handleFile = (f: File) => {
    const err = validate(f)
    if (err) { setError(err); return }
    setError(null)
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

  const pollUntilDone = async (facturaId: string) => {
    const MAX_POLLS = 30
    for (let i = 0; i < MAX_POLLS; i++) {
      await new Promise((r) => setTimeout(r, 3000))
      const res = await fetch(`/api/facturas/${facturaId}`)
      if (!res.ok) break
      const data = await res.json() as { estado: string }
      if (data.estado !== "PROCESANDO") break
      setProgress(`Procesando con IA... (${i + 1}/${MAX_POLLS})`)
    }
  }

  const upload = async () => {
    if (!file) return
    setUploading(true)
    setError(null)
    setProgress("Subiendo archivo...")

    try {
      const form = new FormData()
      form.append("file", file)
      if (empresaId) form.append("empresaId", empresaId)

      const res = await fetch("/api/facturas/upload", { method: "POST", body: form })
      const data = await res.json() as { facturaId?: string; error?: string }

      if (!res.ok) throw new Error(data.error ?? "Error al subir la factura")

      setProgress("Extrayendo datos con IA...")
      await pollUntilDone(data.facturaId!)
      setFile(null)
      setProgress(null)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error desconocido")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mb-6">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
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

      {error && <p className="mt-2 text-sm text-[#DC2626]">{error}</p>}

      {file && (
        <div className="mt-3 flex items-center gap-3">
          <Button onClick={upload} disabled={uploading} className="gap-2">
            {uploading && <LoadingSpinner className="h-4 w-4" />}
            {uploading ? (progress ?? "Procesando...") : "Subir y procesar"}
          </Button>
          {!uploading && (
            <Button variant="outline" onClick={() => setFile(null)}>
              Cancelar
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
