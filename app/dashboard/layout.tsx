import type React from "react"
import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { UserSidebar } from "@/components/user-sidebar"

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
    <div className="flex h-screen bg-gray-50">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <UserSidebar user={user} />
      </div>
      
      <main className="flex-1 overflow-y-auto">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <UserSidebar user={user} />
        </div>
        
        {children}
      </main>
    </div>
  )
}
