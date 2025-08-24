import { AdminNavigation } from "@/components/admin-navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      <main className="lg:pl-64">
        {children}
      </main>
    </div>
  )
}