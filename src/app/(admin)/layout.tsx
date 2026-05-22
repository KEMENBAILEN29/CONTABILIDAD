import { auth } from "@/lib/auth/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/shared/Sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session || session.user.role !== "ADMIN") redirect("/login")

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar role="ADMIN" userName={session.user.name} />
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  )
}
