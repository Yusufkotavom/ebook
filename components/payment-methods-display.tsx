"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CreditCard, Wallet, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { useCurrency } from "@/contexts/currency-context"

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
}

export function PaymentMethodsDisplay({ paymentMethods, orderTotal }: PaymentMethodsDisplayProps) {
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
    if (type === "bank") {
      // Format bank account: 1234567890 -> 1234-567-890
      return accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3")
    } else {
      // Format phone number: 081234567890 -> 0812-3456-7890
      return accountNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3")
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
    <div className="space-y-4">
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
                  {method.type === "bank" ? (
                    <CreditCard className="h-5 w-5 text-blue-600" />
                  ) : (
                    <Wallet className="h-5 w-5 text-green-600" />
                  )}
                  <div>
                    <CardTitle className="text-lg">{method.name}</CardTitle>
                    <CardDescription>
                      {method.type === "bank" ? "Bank Transfer" : "E-Wallet Transfer"}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant={method.type === "bank" ? "default" : "secondary"}>
                  {method.type === "bank" ? "Bank" : "E-Wallet"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {method.account_number && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">
                      {method.type === "bank" ? "Account Number" : "Phone Number"}
                    </p>
                    <p className="font-mono text-lg font-semibold">
                      {formatAccountNumber(method.account_number, method.type)}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => method.account_number && copyToClipboard(method.account_number, `${method.id}-number`)}
                  >
                    {copiedField === `${method.id}-number` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              )}

              {method.account_name && (
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm text-gray-600">Account Name</p>
                    <p className="font-semibold">{method.account_name}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => method.account_name && copyToClipboard(method.account_name, `${method.id}-name`)}
                  >
                    {copiedField === `${method.id}-name` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
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

      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-amber-800">Important Notes:</p>
              <ul className="space-y-1 text-amber-700">
                <li>• Please transfer the exact amount shown above</li>
                <li>• Keep your payment proof (screenshot/receipt)</li>
                <li>• Your order will be processed after payment verification</li>
                <li>• If you have any issues, contact our support team</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}