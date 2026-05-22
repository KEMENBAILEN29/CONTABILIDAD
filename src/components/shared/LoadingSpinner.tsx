import { cn } from "@/lib/utils"

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-block h-5 w-5 animate-spin rounded-full border-2 border-[#E2E8F0] border-t-[#2563EB]",
        className
      )}
      role="status"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  )
}
