import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PaymentMethodForm } from "@/components/payment-method-form"

export default function AddPaymentMethodPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/settings/payment-methods">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Payment Methods
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Add Payment Method</h1>
        <p className="text-gray-600">Add a new bank account or e-wallet for customer payments</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Payment Method Details</CardTitle>
          <CardDescription>
            Configure a new payment option for your customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentMethodForm />
        </CardContent>
      </Card>
    </div>
  )
}