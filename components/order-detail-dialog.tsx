"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Copy, Download } from "lucide-react"

interface Order {
  id: string
  total_amount: string
  status: string
  payment_method: string
  created_at: string
  profiles: { email: string } | null
  order_items: Array<{
    quantity: number
    price: string
    products: { title: string; author: string; download_url?: string } | null
  }>
}

interface OrderDetailDialogProps {
  order: Order
  onClose: () => void
}

export function OrderDetailDialog({ order, onClose }: OrderDetailDialogProps) {
  const copyOrderId = () => {
    navigator.clipboard.writeText(order.id)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Order Details
            <Badge
              variant={order.status === "paid" ? "default" : order.status === "pending" ? "secondary" : "destructive"}
            >
              {order.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>Complete order information and customer details</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Order ID</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="text-sm bg-gray-100 px-2 py-1 rounded">{order.id}</code>
                <Button size="sm" variant="outline" onClick={copyOrderId}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Customer Email</label>
              <p className="mt-1">{order.profiles?.email || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Order Date</label>
              <p className="mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Payment Method</label>
              <p className="mt-1 capitalize">{order.payment_method}</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-500">Items Ordered</label>
            <div className="mt-2 space-y-3">
              {order.order_items.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <h4 className="font-medium">{item.products?.title}</h4>
                    <p className="text-sm text-gray-600">by {item.products?.author}</p>
                    <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${Number.parseFloat(item.price).toFixed(2)}</p>
                    {order.status === "paid" && item.products?.download_url && (
                      <Button size="sm" variant="outline" className="mt-1 bg-transparent">
                        <Download className="h-3 w-3 mr-1" />
                        Download
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total Amount:</span>
              <span>${Number.parseFloat(order.total_amount).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
