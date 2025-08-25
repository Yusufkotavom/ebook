import { AdminNavigation } from "@/components/admin-navigation"
import { AdminPageLoading } from "@/components/page-loading"
import { DevCompilationIndicator } from "@/components/compilation-detector"
import { Suspense } from "react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 admin-progress">
      <AdminNavigation />
      <main className="lg:pl-64">
        <Suspense fallback={<AdminPageLoading />}>
          {children}
        </Suspense>
      </main>
      <DevCompilationIndicator />
    </div>
  )
}