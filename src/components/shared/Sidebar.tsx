"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  TrendingUp,
  LogOut,
  Building2,
  ScanLine,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface NavItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

const adminItems: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Clientes", href: "/admin/clientes", icon: Users },
]

const clienteItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Facturas", href: "/facturas", icon: FileText },
  { label: "Escanear", href: "/escaner", icon: ScanLine },
  { label: "Proveedores", href: "/proveedores", icon: Building2 },
  { label: "Informes", href: "/informes", icon: BarChart3 },
]

interface SidebarProps {
  role: "ADMIN" | "CLIENTE"
  userName: string
}

export function Sidebar({ role, userName }: SidebarProps) {
  const pathname = usePathname()
  const items = role === "ADMIN" ? adminItems : clienteItems

  return (
    <aside className="flex h-screen w-60 flex-col border-r border-[#E2E8F0] bg-[#1E3A5F]">
      <div className="flex h-16 items-center gap-2 px-6 border-b border-white/10">
        <TrendingUp className="h-6 w-6 text-white" />
        <span className="text-base font-bold text-white">GestorIA</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {items.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors duration-150",
                    active
                      ? "bg-white/10 text-white"
                      : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="mb-3 px-1">
          <p className="text-xs text-white/50 uppercase tracking-wider">
            {role === "ADMIN" ? "Administrador" : "Empresa"}
          </p>
          <p className="text-sm text-white truncate">{userName}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors duration-150"
        >
          <LogOut className="h-4 w-4" />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
