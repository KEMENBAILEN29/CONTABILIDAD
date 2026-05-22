import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/shared/Sidebar";

export default async function ClienteLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "CLIENTE") redirect("/login");

  return (
    <div className="flex h-screen bg-[#F8FAFC]">
      <Sidebar role="CLIENTE" userName={session.user.name ?? "Cliente"} />
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-[1280px] mx-auto px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
