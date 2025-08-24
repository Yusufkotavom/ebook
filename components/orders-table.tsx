"use client"

import { createClient } from "@/lib/client"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Eye, Send } from "lucide-react"
import { useState } from "react"
import { useCurrency } from "@/contexts/currency-context"
import { NotificationDialog } from "./notification-dialog"
import { OrderDetailDialog } from "./order-detail-dialog"

interface Order {
  id: string
  total_amount: string
  status: string
  payment_method: string
  created_at: string
  user_id: string | null
  guest_email: string | null
  guest_name: string | null
  guest_whatsapp: string | null
  profiles: { 
    email: string
    full_name: string | null
    whatsapp_number: string | null
  } | null
  order_items: Array<{
    quantity: number
    price: string
    products: { title: string; author: string } | null
  }>
}

interface OrdersTableProps {
  orders: Order[]
}

export function OrdersTable({ orders: initialOrders }: OrdersTableProps) {
  const [orders, setOrders] = useState(initialOrders)
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const { formatPrice } = useCurrency()
  const [notificationOrder, setNotificationOrder] = useState<Order | null>(null)

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingOrder(orderId)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", orderId)

      if (error) throw error

      setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))

      if (newStatus === "paid") {
        const order = orders.find((o) => o.id === orderId)
        if (order?.profiles?.email || order?.guest_email) {
          await sendPaymentConfirmation(orderId, order.profiles?.email || order.guest_email || "")
        }
      }
    } catch (error) {
      console.error("Error updating order:", error)
    } finally {
      setUpdatingOrder(null)
    }
  }

  const sendPaymentConfirmation = async (orderId: string, email: string) => {
    try {
      const response = await fetch("/api/notifications/payment-confirmed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, email }),
      })

      if (!response.ok) throw new Error("Failed to send notification")

      console.log(`Payment confirmation sent for order ${orderId}`)
    } catch (error) {
      console.error("Error sending payment confirmation:", error)
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order ID</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-mono text-sm">{order.id.slice(0, 8)}...</TableCell>
              <TableCell>{order.profiles?.email || order.guest_email || "N/A"}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="text-sm">
                      {item.products?.title} ({item.quantity}x)
                    </div>
                  ))}
                </div>
              </TableCell>
              <TableCell>{formatPrice(order.total_amount)}</TableCell>
              <TableCell>
                <Select
                  value={order.status}
                  onValueChange={(value) => updateOrderStatus(order.id, value)}
                  disabled={updatingOrder === order.id}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </TableCell>
              <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setSelectedOrder(order)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setNotificationOrder(order)}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {selectedOrder && <OrderDetailDialog order={selectedOrder} onClose={() => setSelectedOrder(null)} />}

      {notificationOrder && <NotificationDialog order={notificationOrder} onClose={() => setNotificationOrder(null)} />}
    </>
  )
}
