import { createClient } from "@/lib/server"
import { PaymentMethodsDisplay } from "@/components/payment-methods-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"

interface PaymentPageProps {
  searchParams: Promise<{ order?: string; total?: string }>
}

export default async function PaymentPage({ searchParams }: PaymentPageProps) {
  const { order: orderId, total } = await searchParams

  if (!orderId || !total) {
    notFound()
  }

  // Use server client to fetch payment methods (should work with public access policy)
  const supabase = await createClient()

  const { data: paymentMethods, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching payment methods:", error)
  }

  const orderTotal = parseFloat(total)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Payment</h1>
          <p className="text-gray-600">Order ID: <span className="font-mono font-semibold">{orderId.slice(0, 8)}</span></p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>
                  Choose your preferred payment method and follow the instructions
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethods && paymentMethods.length > 0 ? (
                  <PaymentMethodsDisplay
                    paymentMethods={paymentMethods}
                    orderTotal={orderTotal}
                    orderId={orderId}
                  />
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">Payment methods are currently unavailable.</p>
                    <p className="text-sm text-gray-400">
                      Please contact support for assistance with your payment.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-green-800">What's Next?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm text-green-700">
                  <p className="font-medium">1. Make Payment</p>
                  <p>Transfer to one of the accounts above</p>
                  
                  <p className="font-medium">2. Send Proof</p>
                  <p>Send your transfer receipt via WhatsApp</p>
                  
                  <p className="font-medium">3. Get Access</p>
                  <p>Receive download links after verification</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-blue-200 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-blue-800">Need Help?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-blue-700 mb-3">
                  Having trouble with payment? Our support team is here to help!
                </p>
                <div className="space-y-2">
                  <Link href="/dashboard/orders">
                    <Button variant="outline" size="sm" className="w-full">
                      View My Orders
                    </Button>
                  </Link>
                  <Link href="https://wa.me/6285799520350?text=Hello!%20I%20need%20help%20with%20payment%20for%20my%20order." target="_blank">
                    <Button variant="outline" size="sm" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                      WhatsApp Support
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}