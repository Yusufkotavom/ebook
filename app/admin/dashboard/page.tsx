import { createClient } from "@/lib/server"
import { SectionLoading } from "@/components/page-loading"
import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Clock, 
  Plus, 
  Eye,
  BarChart3,
  Users,
  ArrowUpRight
} from "lucide-react"
import Link from "next/link"
import { formatPriceServer } from "@/lib/currency-server"
import { AdminDashboardOrders } from "@/components/admin-dashboard-orders"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  // Get dashboard stats
  const [
    { count: totalProducts }, 
    { count: totalOrders }, 
    { count: pendingOrders }, 
    { data: recentOrders }
  ] = await Promise.all([
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
        user_id,
        guest_email,
        guest_name
      `)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  // Fetch profiles for recent orders if they have user_ids
  let ordersWithProfiles = recentOrders
  if (recentOrders && recentOrders.length > 0) {
    const userIds = recentOrders
      .filter(order => order.user_id)
      .map(order => order.user_id)
    
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, email")
        .in("id", userIds)
      
      if (profiles) {
        ordersWithProfiles = recentOrders.map(order => ({
          ...order,
          profiles: order.user_id ? profiles.find(p => p.id === order.user_id) : null
        }))
      }
    }
  }

  const totalRevenue = await supabase
    .from("orders")
    .select("total_amount")
    .eq("status", "paid")
    .then(({ data }) => data?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0)

  const formattedRevenue = await formatPriceServer(totalRevenue)

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild size="sm">
            <Link href="/admin/products/add">
              <Plus className="h-4 w-4 mr-2" />
              Add Product
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/">
              <Eye className="h-4 w-4 mr-2" />
              View Store
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {/* Total Products */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Products</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalProducts || 0}</p>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    Active
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Package className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
              </div>
            </div>
            <Link href="/admin/products" className="absolute inset-0">
              <span className="sr-only">View products</span>
            </Link>
          </CardContent>
        </Card>

        {/* Total Orders */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Orders</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{totalOrders || 0}</p>
                <div className="flex items-center space-x-1">
                  <Badge variant="secondary" className="text-xs">
                    All time
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
              </div>
            </div>
            <Link href="/admin/orders" className="absolute inset-0">
              <span className="sr-only">View orders</span>
            </Link>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900">{pendingOrders || 0}</p>
                <div className="flex items-center space-x-1">
                  <Badge variant="destructive" className="text-xs">
                    {pendingOrders ? "Needs attention" : "All clear"}
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-orange-600" />
              </div>
            </div>
            <Link href="/admin/orders?status=pending" className="absolute inset-0">
              <span className="sr-only">View pending orders</span>
            </Link>
          </CardContent>
        </Card>

        {/* Revenue */}
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-200">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Revenue</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formattedRevenue}</p>
                <div className="flex items-center space-x-1">
                  <Badge variant="default" className="text-xs bg-green-600">
                    Paid orders
                  </Badge>
                </div>
              </div>
              <div className="p-2 bg-purple-100 rounded-lg">
                <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Recent Orders - Takes 2 columns on XL screens */}
        <div className="xl:col-span-2">
                      <AdminDashboardOrders orders={ordersWithProfiles || []} />
        </div>

        {/* Quick Actions - Takes 1 column on XL screens */}
        <div className="space-y-6">
          {/* Product Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Package className="h-5 w-5 mr-2" />
                Product Management
              </CardTitle>
              <CardDescription>
                Manage your ebook catalog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/products">
                  <Eye className="h-4 w-4 mr-2" />
                  View All Products
                  <Badge variant="secondary" className="ml-auto">
                    {totalProducts || 0}
                  </Badge>
                </Link>
              </Button>
              <Button asChild className="w-full justify-start">
                <Link href="/admin/products/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Store Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <BarChart3 className="h-5 w-5 mr-2" />
                Store Management
              </CardTitle>
              <CardDescription>
                Configure your store settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/settings">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Store Settings
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/settings/payment-methods">
                  <Package className="h-4 w-4 mr-2" />
                  Payment Methods
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/admin/notifications">
                  <Users className="h-4 w-4 mr-2" />
                  Send Notifications
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="text-sm font-medium">
                  {totalOrders > 0 ? Math.round((totalOrders / (totalOrders + 10)) * 100) : 0}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Avg. Order Value</span>
                <span className="text-sm font-medium">
                  {totalOrders > 0 ? await formatPriceServer(totalRevenue / totalOrders) : await formatPriceServer(0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Pending Rate</span>
                <span className="text-sm font-medium">
                  {totalOrders > 0 ? Math.round(((pendingOrders || 0) / totalOrders) * 100) : 0}%
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
