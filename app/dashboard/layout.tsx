import type React from "react"
import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { UserSidebar } from "@/components/user-sidebar"
import { DashboardPageLoading } from "@/components/page-loading"
import { Suspense } from "react"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dashboard-progress">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <UserSidebar user={user} />
      </div>
      
      <main className="flex-1 pb-20 md:pb-0">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <UserSidebar user={user} />
        </div>
        
        <Suspense fallback={<DashboardPageLoading />}>
          {children}
        </Suspense>
      </main>
    </div>
  )
}
