"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => { console.error(error) }, [error])
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-center">
      <h2 className="text-lg font-semibold text-[#0F172A]">Algo salió mal</h2>
      <p className="mt-1 text-sm text-[#64748B]">{error.message}</p>
      <Button onClick={reset} className="mt-4">Reintentar</Button>
    </div>
  )
}
