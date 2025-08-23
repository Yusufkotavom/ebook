import type React from "react"
import { createClient } from "@/lib/server"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) {
    redirect("/admin/login")
  }

  // Check if user is admin
  const { data: adminData, error: adminError } = await supabase
    .from("admin_users")
    .select("id")
    .eq("id", user.id)
    .single()

  if (adminError || !adminData) {
    redirect("/admin/login")
  }

  return (
    <div className="flex h-screen bg-slate-50">
      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden lg:block">
        <AdminSidebar />
      </div>
      
      <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
        {/* Mobile Navigation */}
        <div className="lg:hidden">
          <AdminSidebar />
        </div>
        
        <div className="min-h-full">{children}</div>
      </main>
    </div>
  )
}
