import { LoadingSpinner } from "@/components/shared/LoadingSpinner"

interface ProcesandoSpinnerProps {
  poll: number
}

export function ProcesandoSpinner({ poll }: ProcesandoSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-4">
      <LoadingSpinner className="h-10 w-10 text-[#2563EB]" />
      <p className="text-base font-medium text-[#0F172A]">Procesando con IA...</p>
      {poll > 0 && (
        <p className="text-sm text-[#64748B]">Analizando documento ({poll}/30)</p>
      )}
    </div>
  )
}
