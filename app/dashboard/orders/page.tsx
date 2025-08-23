import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import Link from "next/link"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      total_amount,
      status,
      payment_method,
      created_at,
      order_items(
        id,
        quantity,
        price,
        products(
          id,
          title,
          author,
          download_url
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600">View and manage your ebook purchases</p>
      </div>

      <div className="space-y-6">
        {orders?.map((order) => (
          <Card key={order.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">Order #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription>{new Date(order.created_at).toLocaleDateString()}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-lg">${Number.parseFloat(order.total_amount).toFixed(2)}</p>
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
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.products?.title}</h4>
                      <p className="text-sm text-gray-600">by {item.products?.author}</p>
                      <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">${Number.parseFloat(item.price).toFixed(2)}</span>
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
              </div>

              {order.status === "pending" && (
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Payment Pending:</strong> Your order is awaiting payment confirmation. You&apos;ll receive
                    download links once payment is processed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {(!orders || orders.length === 0) && (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 mb-4">You haven&apos;t placed any orders yet.</p>
              <Link href="/">
                <Button>Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
