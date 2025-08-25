"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, Copy, Check, ExternalLink } from "lucide-react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/client"
import { useCurrency } from "@/contexts/currency-context"
import { WhatsAppOrderSupport } from "@/components/whatsapp-support"
import Link from "next/link"

interface PaymentMethod {
  id: string
  type: string
  name: string
  account_number: string | null
  account_name: string | null
  instructions: string | null
  is_active: boolean
  display_order: number
}

interface OrderPaymentInfoProps {
  orderId: string
  orderTotal: number
  orderStatus: string
}

export function OrderPaymentInfo({ orderId, orderTotal, orderStatus }: OrderPaymentInfoProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)
  const { formatPrice } = useCurrency()

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from("payment_methods")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (!error && data) {
        setPaymentMethods(data)
      }
    }

    if (orderStatus === "pending") {
      fetchPaymentMethods()
    }
  }, [orderStatus])

  const copyToClipboard = async (text: string, fieldId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(fieldId)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const formatAccountNumber = (accountNumber: string | null, type: string) => {
    if (!accountNumber) return ""
    if (type === "ewallet") {
      return accountNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
    } else {
      return accountNumber.replace(/(\d{4})/g, "$1 ").trim()
    }
  }

  if (orderStatus === "paid") {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2">
          <Check className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Payment Completed</span>
        </div>
        <p className="text-sm text-green-700 mt-1">
          Your payment has been verified and processed.
        </p>
      </div>
    )
  }

  if (orderStatus !== "pending") {
    return null
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-600" />
            <CardTitle className="text-lg text-orange-800">Payment Required</CardTitle>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <Badge variant="secondary" className="bg-orange-100 text-orange-800 self-start sm:self-auto">
              Pending Payment
            </Badge>
            <Link href={`/checkout/payment?order=${orderId}&total=${orderTotal}`}>
              <Button size="sm" variant="outline" className="w-full sm:w-auto">
                <ExternalLink className="h-4 w-4 mr-1" />
                View Details
              </Button>
            </Link>
          </div>
        </div>
        <CardDescription className="text-orange-700 mt-2">
          Complete your payment to access your ebooks. Total amount: {formatPrice(orderTotal)}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* WhatsApp Order Support */}
          <div>
            <WhatsAppOrderSupport 
              orderId={orderId}
              className="mb-4"
            />
          </div>

          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white"
            >
              {isExpanded ? "Hide" : "Show"} Payment Methods
            </Button>
          </div>

          {isExpanded && (
            <div className="space-y-3 pt-3 border-t border-orange-200">
              {paymentMethods.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paymentMethods.slice(0, 2).map((method) => (
                    <div key={method.id} className="p-3 bg-white rounded-lg border border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        {method.type === "bank" ? (
                          <CreditCard className="h-4 w-4 text-gray-600" />
                        ) : (
                          <Wallet className="h-4 w-4 text-gray-600" />
                        )}
                        <span className="font-medium text-sm">{method.name}</span>
                      </div>
                      
                      {method.account_number && (
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono break-all">
                            {formatAccountNumber(method.account_number, method.type)}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(method.account_number!, `${method.id}-quick`)}
                            className="h-6 px-2 ml-2 flex-shrink-0"
                          >
                            {copiedField === `${method.id}-quick` ? (
                              <Check className="h-3 w-3" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-orange-700">No payment methods available.</p>
              )}

              {paymentMethods.length > 2 && (
                <Link href={`/checkout/payment?order=${orderId}&total=${orderTotal}`}>
                  <Button variant="outline" size="sm" className="w-full bg-white">
                    View All Payment Methods
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}