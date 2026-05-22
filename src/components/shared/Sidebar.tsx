"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { Building2, LayoutDashboard, FileText, Users, BarChart3, LogOut, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarProps {
  role: "ADMIN" | "CLIENTE";
  userName: string;
}

const adminNav: NavItem[] = [
  { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/admin/clientes", label: "Clientes", icon: <Users className="h-4 w-4" /> },
];

const clienteNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/facturas", label: "Facturas", icon: <FileText className="h-4 w-4" /> },
  { href: "/proveedores", label: "Proveedores", icon: <Users className="h-4 w-4" /> },
  { href: "/informes", label: "Informes", icon: <BarChart3 className="h-4 w-4" /> },
];

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname();
  const navItems = role === "ADMIN" ? adminNav : clienteNav;

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[#E2E8F0] bg-[#1E3A5F]">
      <div className="flex items-center gap-2 px-4 py-5 border-b border-white/10">
        <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-white/10">
          <Building2 className="h-4 w-4 text-white" />
        </div>
        <span className="text-sm font-semibold text-white">GestorIA</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-[6px] px-3 py-2 text-sm font-medium transition-colors duration-150",
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              )}
            >
              {item.icon}
              {item.label}
              {isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-2 py-3">
        <div className="px-3 py-1 mb-2">
          <p className="text-xs text-white/50 truncate">{userName}</p>
          <p className="text-xs text-white/30">{role === "ADMIN" ? "Administrador" : "Cliente"}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
          onClick={() => signOut({ callbackUrl: "/login" })}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Cerrar sesión
        </Button>
      </div>
    </aside>
  );
}
