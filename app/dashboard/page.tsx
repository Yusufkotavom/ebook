"use client"

import { createClient } from "@/lib/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingBag, Download, DollarSign, Clock } from "lucide-react"
import { useCurrency } from "@/contexts/currency-context"
import { SectionLoading } from "@/components/page-loading"
import { usePageLoading } from "@/hooks/use-loading"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { User } from "@supabase/supabase-js"

interface OrderItem {
  quantity: number
  products: {
    title: string
    author: string
  } | null
}

interface Order {
  id: string
  total_amount: string
  status: string
  created_at: string
  order_items: OrderItem[]
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [totalOrders, setTotalOrders] = useState(0)
  const [completedOrders, setCompletedOrders] = useState(0)
  const [totalSpent, setTotalSpent] = useState(0)
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { formatPrice } = useCurrency()
  const router = useRouter()

  useEffect(() => {
    const loadDashboardData = async () => {
      const supabase = createClient()

      const { data: { user: currentUser } } = await supabase.auth.getUser()

      if (!currentUser) {
        router.push("/auth/login")
        return
      }

      setUser(currentUser)

      try {
        // Get user stats
        const [
          { count: totalOrdersCount },
          { count: completedOrdersCount },
          { data: recentOrdersData },
          { data: paidOrdersData }
        ] = await Promise.all([
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id),
          supabase.from("orders").select("*", { count: "exact", head: true }).eq("user_id", currentUser.id).eq("status", "paid"),
          supabase
            .from("orders")
            .select(
              `
              id,
              total_amount,
              status,
              created_at,
              order_items(
                quantity,
                products(title, author)
              )
            `,
            )
            .eq("user_id", currentUser.id)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("orders")
            .select("total_amount")
            .eq("user_id", currentUser.id)
            .eq("status", "paid")
        ])

        setTotalOrders(totalOrdersCount || 0)
        setCompletedOrders(completedOrdersCount || 0)
        setRecentOrders(recentOrdersData || [])

        const totalSpentAmount = paidOrdersData?.reduce((sum, order) => sum + Number.parseFloat(order.total_amount), 0) || 0
        setTotalSpent(totalSpentAmount)

      } catch (error) {
        console.error("Error loading dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadDashboardData()
  }, [router])

  if (isLoading) {
    return <SectionLoading title="Loading your dashboard..." size="lg" className="min-h-screen" />
  }

  if (!user) return null

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 lg:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 text-sm sm:text-base">Welcome back! Here's your account overview.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 lg:mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Orders</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{completedOrders}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{formatPrice(totalSpent)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalOrders - completedOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
          <CardDescription>Your latest purchases and their status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentOrders?.map((order) => (
              <div key={order.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border rounded-lg">
                <div className="flex-1 min-w-0">
                  <div className="space-y-1">
                    {order.order_items.map((item, index) => (
                      <p key={index} className="font-medium text-sm truncate">
                        {item.products?.title} by {item.products?.author}
                      </p>
                    ))}
                  </div>
                  <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-left sm:text-right flex-shrink-0">
                  <p className="font-medium text-lg">{formatPrice(order.total_amount)}</p>
                  <span
                    className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      order.status === "paid"
                        ? "bg-green-100 text-green-800"
                        : order.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {(!recentOrders || recentOrders.length === 0) && (
              <p className="text-gray-500 text-center py-8">No orders yet. Start shopping to see your orders here!</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
