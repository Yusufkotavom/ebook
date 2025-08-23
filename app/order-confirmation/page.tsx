import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Mail, Clock } from "lucide-react"
import Link from "next/link"
import { redirect } from "next/navigation"

interface PageProps {
  searchParams: { order?: string; email?: string }
}

export default async function OrderConfirmationPage({ searchParams }: PageProps) {
  const { order: orderId, email } = searchParams

  if (!orderId || !email) {
    redirect("/")
  }

  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      created_at,
      order_items(
        quantity,
        price,
        products(title, author)
      )
    `)
    .eq("id", orderId)
    .single()

  if (error || !order) {
    redirect("/")
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Order Confirmed!</CardTitle>
            <CardDescription>
              Thank you for your purchase. Your order has been received and is being processed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium mb-2">Order Details</h3>
                <div className="text-sm space-y-1">
                  <p>
                    <strong>Order ID:</strong> {order.id.slice(0, 8)}
                  </p>
                  <p>
                    <strong>Email:</strong> {decodeURIComponent(email)}
                  </p>
                  <p>
                    <strong>Total:</strong> ${Number.parseFloat(order.total_amount).toFixed(2)}
                  </p>
                  <p>
                    <strong>Status:</strong> {order.status}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Items Ordered</h3>
                <div className="space-y-2">
                  {order.order_items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.products?.title} by {item.products?.author}
                      </span>
                      <span>${Number.parseFloat(item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-blue-900">What&apos;s Next?</h4>
                    <p className="text-sm text-blue-800 mt-1">
                      We&apos;ve sent payment instructions to your email address. Once payment is confirmed, you&apos;ll receive
                      download links for your ebooks.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-start space-x-3">
                  <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-yellow-900">Processing Time</h4>
                    <p className="text-sm text-yellow-800 mt-1">
                      Orders are typically processed within 24 hours. You can track your order status in your account
                      dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" className="w-full bg-transparent">
                    Access Your Account
                  </Button>
                </Link>
                <Link href="/" className="flex-1">
                  <Button className="w-full">Continue Shopping</Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
