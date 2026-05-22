import { FileX } from "lucide-react"

interface EmptyStateProps {
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <FileX className="mb-4 h-12 w-12 text-[#64748B]" />
      <h3 className="text-base font-semibold text-[#0F172A]">{title}</h3>
      {description && <p className="mt-1 text-sm text-[#64748B]">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}
