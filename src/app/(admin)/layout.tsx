import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/login");

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar role="ADMIN" userName={session.user.name ?? "Admin"} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
