"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye, Clock, CheckCircle, XCircle } from "lucide-react"
import Link from "next/link"
import { useCurrency } from "@/contexts/currency-context"
import { SectionLoading } from "@/components/page-loading"

interface Order {
  id: string
  total_amount: string
  status: string
  created_at: string
  user_id?: string
  guest_email?: string
  guest_name?: string
  profiles?: {
    email: string
  }
}

interface AdminDashboardOrdersProps {
  orders: Order[]
}

export function AdminDashboardOrders({ orders }: AdminDashboardOrdersProps) {
  const { formatPrice } = useCurrency()

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />
      default:
        return <Clock className="h-4 w-4 text-orange-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-orange-100 text-orange-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center text-lg">
              <ShoppingCart className="h-5 w-5 mr-2" />
              Recent Orders
            </CardTitle>
            <CardDescription>
              Latest customer purchases and their status
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/orders">
              <Eye className="h-4 w-4 mr-2" />
              View All
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col sm:flex-row gap-3 p-4 bg-gray-50 rounded-lg border hover:bg-gray-100 transition-colors"
              >
                {/* Order Info */}
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(order.status)}
                      <span className="font-medium text-sm">
                        Order #{order.id.slice(0, 8)}
                      </span>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(order.status)}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {order.profiles?.email || order.guest_email || order.guest_name || 'Guest Order'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>

                {/* Order Amount */}
                <div className="flex items-center justify-between sm:flex-col sm:items-end sm:justify-center space-y-2">
                  <span className="font-bold text-lg">
                    {formatPrice(order.total_amount)}
                  </span>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/orders?id=${order.id}`}>
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-4">Orders will appear here once customers start purchasing.</p>
            <Button asChild>
              <Link href="/admin/products/add">Add Your First Product</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}