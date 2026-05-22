interface HeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function Header({ title, description, children }: HeaderProps) {
  return (
    <div className="flex items-start justify-between pb-6 border-b border-[#E2E8F0] mb-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F172A]">{title}</h1>
        {description && <p className="mt-1 text-sm text-[#64748B]">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  );
}
