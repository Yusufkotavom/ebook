import { DashboardPageLoading } from "@/components/page-loading"
import { Suspense } from "react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="dashboard-progress">
      <Suspense fallback={<DashboardPageLoading />}>
        {children}
      </Suspense>
    </div>
  )
}
