import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Plus } from "lucide-react"
import Link from "next/link"
import { PaymentMethodsTable } from "@/components/payment-methods-table"

export default async function PaymentMethodsPage() {
  const supabase = await createClient()

  const { data: paymentMethods, error } = await supabase
    .from("payment_methods")
    .select("*")
    .order("display_order", { ascending: true })

  if (error) {
    console.error("Error fetching payment methods:", error)
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Settings
          </Button>
        </Link>
      </div>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
          <p className="text-gray-600">Manage bank accounts and e-wallet options for customers</p>
        </div>
        <Link href="/admin/settings/payment-methods/add">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Payment Method
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Available Payment Methods</CardTitle>
          <CardDescription>
            Configure bank accounts and e-wallet providers that customers can use for payments
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentMethodsTable paymentMethods={paymentMethods || []} />
        </CardContent>
      </Card>
    </div>
  )
}