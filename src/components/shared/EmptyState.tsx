import { FileX } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function EmptyState({ title, description, children }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
        <FileX className="h-6 w-6 text-[#64748B]" />
      </div>
      <h3 className="mb-1 text-base font-semibold text-[#0F172A]">{title}</h3>
      {description && <p className="mb-4 text-sm text-[#64748B] max-w-xs">{description}</p>}
      {children}
    </div>
  );
}
