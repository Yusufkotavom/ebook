"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useCurrency } from "@/contexts/currency-context"
import { WhatsAppPaymentSupport } from "@/components/whatsapp-support"

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

interface PaymentMethodsDisplayProps {
  paymentMethods: PaymentMethod[]
  orderTotal: number
  orderId?: string
}

export function PaymentMethodsDisplay({ paymentMethods, orderTotal, orderId }: PaymentMethodsDisplayProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const { formatPrice } = useCurrency()

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
      // Format phone numbers
      return accountNumber.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
    } else {
      // Format bank account numbers
      return accountNumber.replace(/(\d{4})/g, "$1 ").trim()
    }
  }

  if (paymentMethods.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-gray-500">No payment methods available at the moment.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Total Amount to Pay</h3>
        <div className="text-3xl font-bold text-blue-600">{formatPrice(orderTotal)}</div>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="border-2 hover:border-blue-200 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-full">
                    {method.type === "bank" ? (
                      <CreditCard className="h-5 w-5 text-gray-600" />
                    ) : (
                      <Wallet className="h-5 w-5 text-gray-600" />
                    )}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription>
                      {method.type === "bank" ? "Bank Transfer" : "E-Wallet"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {method.account_number && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">
                      {method.type === "bank" ? "Account Number" : "Phone Number"}
                    </p>
                    <p className="font-mono text-lg font-bold">
                      {formatAccountNumber(method.account_number, method.type)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(method.account_number!, `${method.id}-account`)}
                    className="shrink-0"
                  >
                    {copiedField === `${method.id}-account` ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}

              {method.account_name && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Account Name</p>
                    <p className="font-semibold">{method.account_name}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(method.account_name!, `${method.id}-name`)}
                    className="shrink-0"
                  >
                    {copiedField === `${method.id}-name` ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800 font-medium mb-1">Payment Amount</p>
                <p className="text-xl font-bold text-blue-900">{formatPrice(orderTotal)}</p>
              </div>

              {method.instructions && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800 font-medium mb-1">Instructions</p>
                  <p className="text-sm text-yellow-700">{method.instructions}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* WhatsApp Payment Support Section */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold mb-4 text-center">After Payment</h3>
        <WhatsAppPaymentSupport 
          orderId={orderId}
          amount={formatPrice(orderTotal)}
          paymentMethod={paymentMethods.map(m => m.name).join(" or ")}
        />
      </div>

      {/* Important Notes */}
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="text-orange-800 text-lg">Important Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <ul className="text-sm text-orange-700 space-y-1">
            <li>• Please transfer the exact amount: <strong>{formatPrice(orderTotal)}</strong></li>
            <li>• Send your payment proof via WhatsApp for faster verification</li>
            <li>• Your download links will be sent after payment confirmation</li>
            <li>• Payment verification typically takes 1-2 hours during business hours</li>
            <li>• Keep your transaction receipt until you receive confirmation</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}