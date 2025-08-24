import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { formatPriceServer } from "@/lib/currency-server"
import { AdminDashboardOrders } from "@/components/admin-dashboard-orders"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get dashboard stats
  const [{ count: totalProducts }, { count: totalOrders }, { count: pendingOrders }, { data: recentOrders }] =
    await Promise.all([
      supabase.from("products").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }),
      supabase.from("orders").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase
        .from("orders")
        .select(`
        id,
        total_amount,
        status,
        created_at,
        profiles(email)
      `)
        .order("created_at", { ascending: false })
        .limit(5),
    ])

  const totalRevenue = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "paid")
    .then(({ data }) => data?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0)

  const formattedRevenue = await formatPriceServer(totalRevenue)

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 mb-2">Dashboard</h1>
            <p className="text-slate-600 text-sm sm:text-base lg:text-lg">Welcome back! Here&apos;s what&apos;s happening with your store.</p>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-sm text-slate-500">Last updated</p>
            <p className="text-sm font-medium text-slate-700">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-100">Total Products</CardTitle>
            <Package className="h-5 w-5 text-blue-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalProducts || 0}</div>
            <p className="text-xs text-blue-200 mt-1">Active listings</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-100">Total Orders</CardTitle>
            <ShoppingCart className="h-5 w-5 text-green-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{totalOrders || 0}</div>
            <p className="text-xs text-green-200 mt-1">All time orders</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-orange-100">Pending Orders</CardTitle>
            <Clock className="h-5 w-5 text-orange-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{pendingOrders || 0}</div>
            <p className="text-xs text-orange-200 mt-1">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-100">Total Revenue</CardTitle>
            <TrendingUp className="h-5 w-5 text-purple-200" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold">{formattedRevenue}</div>
            <p className="text-xs text-purple-200 mt-1">From paid orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
        <AdminDashboardOrders orders={recentOrders || []} />

      <Card className="border-0 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl text-slate-900">Product Management</CardTitle>
              <CardDescription className="text-slate-600">Quick actions for your product catalog</CardDescription>
            </div>
            <Button asChild>
              <Link href="/admin/products/add">Add New Product</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" asChild>
              <Link href="/admin/products">
                <Package className="h-6 w-6 mb-2" />
                <span>Manage Products</span>
                <span className="text-xs text-muted-foreground">{totalProducts || 0} total</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col items-center justify-center" asChild>
              <Link href="/admin/products/add">
                <Package className="h-6 w-6 mb-2" />
                <span>Add Product</span>
                <span className="text-xs text-muted-foreground">Create new listing</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
