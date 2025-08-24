"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Link from "next/link"
import { useCurrency } from "@/contexts/currency-context"

interface Order {
  id: string
  total_amount: string
  status: string
  created_at: string
  profiles?: {
    email: string
  }
}

interface AdminDashboardOrdersProps {
  orders: Order[]
}

export function AdminDashboardOrders({ orders }: AdminDashboardOrdersProps) {
  const { formatPrice } = useCurrency()

  return (
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
        {orders && orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
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
                    {formatPrice(order.total_amount)}
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
  )
}