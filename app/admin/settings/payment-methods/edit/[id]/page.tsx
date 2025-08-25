import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PaymentMethodForm } from "@/components/payment-method-form"
import { notFound } from "next/navigation"

interface EditPaymentMethodPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPaymentMethodPage({ params }: EditPaymentMethodPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: paymentMethod, error } = await supabase
    .from("payment_methods")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !paymentMethod) {
    notFound()
  }

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
        <h1 className="text-3xl font-bold text-gray-900">Edit Payment Method</h1>
        <p className="text-gray-600">Update the details for {paymentMethod.name}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Payment Method Details</CardTitle>
          <CardDescription>
            Update the information for this payment method
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentMethodForm paymentMethod={paymentMethod} />
        </CardContent>
      </Card>
    </div>
  )
}