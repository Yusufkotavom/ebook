"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/client"
import { PaymentMethodsDisplay } from "@/components/payment-methods-display"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, CheckCircle, Clock, CreditCard } from "lucide-react"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"
import { useCurrency } from "@/contexts/currency-context"

interface PaymentMethod {
  id: string
  name: string
  type: string
  account_number: string
  description: string | null
  is_active: boolean
  display_order: number
}

export function PaymentPageClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { formatPrice } = useCurrency()
  
  const orderId = searchParams.get("order")
  const total = searchParams.get("total")
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    if (!orderId || !total) {
      router.push("/")
      return
    }

    const fetchPaymentData = async () => {
      try {
        setLoading(true)
        const supabase = createClient()

        // Fetch payment methods and order details in parallel
        const [paymentMethodsResult, orderResult] = await Promise.all([
          supabase
            .from("payment_methods")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true }),
          
          supabase
            .from("orders")
            .select(`
              id,
              total_amount,
              status,
              created_at,
              order_items(
                quantity,
                price,
                item_type,
                product_id,
                subscription_package_id,
                products(title, author),
                subscription_packages(name, duration_days)
              )
            `)
            .eq("id", orderId)
            .single()
        ])

        if (paymentMethodsResult.error) {
          console.error("Error fetching payment methods:", paymentMethodsResult.error)
          setPaymentMethods([])
        } else {
          setPaymentMethods(paymentMethodsResult.data || [])
        }

        if (orderResult.error) {
          console.error("Error fetching order:", orderResult.error)
          setError("Order not found")
        } else {
          setOrderData(orderResult.data)
        }

      } catch (err) {
        console.error("Error loading payment page:", err)
        setError("Failed to load payment information")
      } finally {
        // Add a small delay to show the completion animation
        setTimeout(() => {
          setLoading(false)
        }, 800)
      }
    }

    fetchPaymentData()
  }, [orderId, total, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Card className="p-8">
            <CardContent className="space-y-6">
              {/* Order Creation Success */}
              <div className="flex items-center justify-center mb-4">
                <div className="relative">
                  <CheckCircle className="h-16 w-16 text-green-600" />
                  <div className="absolute -top-1 -right-1">
                    <div className="h-4 w-4 bg-green-600 rounded-full animate-ping"></div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Created Successfully!</h2>
                <p className="text-gray-600 mb-4">
                  Order ID: <span className="font-mono font-semibold text-green-600">
                    {orderId?.slice(0, 8)}
                  </span>
                </p>
              </div>

              {/* Loading Steps */}
              <div className="space-y-4 text-left">
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Order created</span>
                </div>
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Items reserved</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <Clock className="h-5 w-5 text-blue-600" />
                    <Spinner size="sm" className="absolute -top-1 -right-1" />
                  </div>
                  <span className="text-sm">Loading payment methods...</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-500">Preparing checkout</span>
                </div>
              </div>

              {/* Total Amount */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-800">Order Total:</span>
                  <span className="text-lg font-bold text-blue-900">
                    {total ? formatPrice(parseFloat(total)) : "Loading..."}
                  </span>
                </div>
              </div>

              {/* Loading Progress */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: "75%" }}></div>
              </div>
              
              <p className="text-xs text-gray-500">
                Setting up your payment options...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-red-500 mb-4">⚠️</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error</h3>
              <p className="text-gray-500 mb-4">{error}</p>
              <Button onClick={() => router.push("/")}>
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const orderTotal = total ? parseFloat(total) : 0

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="inline-block relative mb-4">
            <CheckCircle className="h-20 w-20 text-green-600 animate-bounce" />
            <div className="absolute -top-2 -right-2">
              <div className="h-6 w-6 bg-green-400 rounded-full animate-ping"></div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Order Created Successfully! 🎉
          </h1>
          <p className="text-gray-600">
            Order ID: <span className="font-mono font-semibold bg-green-100 text-green-800 px-2 py-1 rounded">
              {orderId?.slice(0, 8)}
            </span>
          </p>
        </div>

        {/* Back Button */}
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Complete Your Payment
                </CardTitle>
                <CardDescription>
                  Choose your preferred payment method below
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paymentMethods && paymentMethods.length > 0 ? (
                  <PaymentMethodsDisplay
                    paymentMethods={paymentMethods}
                    orderTotal={orderTotal}
                    orderId={orderId || ""}
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

          {/* Order Summary & Help */}
          <div className="space-y-6">
            {/* Order Summary */}
            {orderData && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    {orderData.order_items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div>
                          {item.item_type === 'subscription' ? (
                            <>
                              <div className="font-medium">{item.subscription_packages?.name || 'Subscription Package'}</div>
                              <div className="text-gray-500">
                                {item.subscription_packages?.duration_days 
                                  ? `${item.subscription_packages.duration_days} days access`
                                  : 'Lifetime access'
                                }
                              </div>
                              <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                            </>
                          ) : (
                            <>
                              <div className="font-medium">{item.products?.title || 'Product'}</div>
                              <div className="text-gray-500">by {item.products?.author || 'Unknown'}</div>
                              <div className="text-xs text-gray-400">Qty: {item.quantity}</div>
                            </>
                          )}
                        </div>
                        <div className="font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total:</span>
                      <span className="text-blue-600">{formatPrice(orderTotal)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Help Card */}
            <Card className="border-green-200 bg-green-50">
              <CardHeader>
                <CardTitle className="text-lg text-green-800">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-green-700">
                  Having trouble with payment? Our support team is here to help!
                </p>
                <div className="space-y-2">
                  <Link href="/dashboard/orders">
                    <Button variant="outline" size="sm" className="w-full">
                      View My Orders
                    </Button>
                  </Link>
                  <Link 
                    href="https://wa.me/6285799520350?text=Hello!%20I%20need%20help%20with%20payment%20for%20my%20order." 
                    target="_blank"
                  >
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                    >
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