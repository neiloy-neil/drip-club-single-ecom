import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/Sidebar"
import AdminTopbar from "@/components/admin/AdminTopbar"

export const dynamic = "force-dynamic"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  return (
    <div className="flex min-h-screen w-full bg-muted/20">
      {/* Sidebar */}
      <aside className="hidden md:flex w-[240px] lg:w-[260px] shrink-0 flex-col border-r bg-background">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px]">
          <span className="flex items-center gap-2 font-bold text-base tracking-tight">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs font-bold">D</span>
            DRIP Admin
          </span>
        </div>
        <div className="flex-1 overflow-y-auto py-3 scrollbar-thin">
          <Sidebar />
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        <AdminTopbar email={session.user.email ?? ""} />
        <main className="flex-1 p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
