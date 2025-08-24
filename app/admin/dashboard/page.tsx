import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, TrendingUp, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

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
            <div className="text-2xl sm:text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
            <p className="text-xs text-purple-200 mt-1">From paid orders</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-6 lg:mb-8">
        <Card className="border-0 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="text-lg sm:text-xl text-slate-900">Recent Orders</CardTitle>
                <CardDescription className="text-slate-600">Latest customer purchases and their status</CardDescription>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/admin/orders">View All Orders</Link>
              </Button>
            </div>
          </CardHeader>
        <CardContent className="p-4 sm:p-6">
          {recentOrders && recentOrders.length > 0 ? (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <ShoppingCart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 truncate">
                        {/* @ts-expect-error - Supabase type issue */}
                        {order.profiles?.email || "Guest User"}
                      </p>
                      <p className="text-sm text-slate-500">Order #{order.id.slice(0, 8)}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(order.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="font-bold text-lg text-slate-900">
                      ${Number.parseFloat(order.total_amount).toFixed(2)}
                    </p>
                    <span
                      className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                        order.status === "paid"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : order.status === "pending"
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                            : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No orders yet</p>
              <p className="text-sm text-slate-400">Orders will appear here once customers start purchasing</p>
            </div>
          )}
        </CardContent>
      </Card>

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
