import { auth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/admin/Sidebar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu, Package2, CircleUser } from "lucide-react"

// Admin pages are auth-gated and per-request — never statically prerender
// them. Without this, Next.js tries to build them at build time with no
// session, hitting the DB and exhausting the Supabase pooler's connection limit.
export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()
  
  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect("/")
  }

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <span className="flex items-center gap-2 font-semibold">
              <Package2 className="h-6 w-6" />
              <span>Admin Panel</span>
            </span>
          </div>
          <div className="flex-1 overflow-auto py-2">
            <Sidebar />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger render={
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            } />
            <SheetContent side="left" className="flex flex-col">
              <div className="flex items-center gap-2 text-lg font-semibold mb-6 mt-2">
                <Package2 className="h-6 w-6" />
                <span>Admin Panel</span>
              </div>
              <Sidebar />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            {/* Topbar extra elements */}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{session.user.email}</span>
            <CircleUser className="h-6 w-6" />
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
