"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"
import { OrderPaymentInfo } from "@/components/order-payment-info"
import { useCurrency } from "@/contexts/currency-context"

interface Order {
  id: string
  total_amount: string
  status: string
  created_at: string
  order_items: Array<{
    id: string
    quantity: number
    price: string
    products?: {
      title: string
      author: string
      download_url?: string
    }
  }>
}

interface DashboardOrdersListProps {
  orders: Order[]
}

export function DashboardOrdersList({ orders }: DashboardOrdersListProps) {
  const { formatPrice } = useCurrency()

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <p className="text-gray-500">No orders found.</p>
          <Link href="/products">
            <Button className="mt-4">
              Browse Products
            </Button>
          </Link>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {orders.map((order) => (
        <Card key={order.id}>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg">{formatPrice(order.total_amount)}</p>
                <Badge
                  variant={
                    order.status === "paid" ? "default" : order.status === "pending" ? "secondary" : "destructive"
                  }
                >
                  {order.status}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Order Items */}
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.products?.title}</h4>
                    <p className="text-sm text-gray-600">by {item.products?.author}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium">{formatPrice(item.price)}</span>
                    {order.status === "paid" && item.products?.download_url && (
                      <Link href={item.products.download_url} target="_blank">
                        <Button size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}

              {/* Payment Information */}
              <OrderPaymentInfo 
                orderId={order.id}
                orderTotal={parseFloat(order.total_amount)}
                orderStatus={order.status}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}