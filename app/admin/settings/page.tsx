import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { CurrencySettingsForm } from "@/components/currency-settings-form"

export default async function AdminSettingsPage() {
  const supabase = await createClient()

  // Get current currency settings
  const { data: settings } = await supabase
    .from("app_settings")
    .select("*")
    .eq("key", "currency")
    .single()

  const currentCurrency = settings?.value || "USD"

  return (
    <div className="p-6">
      <div className="mb-6">
        <Link href="/admin/dashboard">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600">Configure your store settings</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Currency Settings</CardTitle>
            <CardDescription>
              Configure the default currency for your store. This will affect all price displays throughout the application.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurrencySettingsForm currentCurrency={currentCurrency} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payment Methods</CardTitle>
            <CardDescription>Configure bank accounts and e-wallets for customer payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Manage the payment options available to your customers, including bank transfers and e-wallet providers.
              </p>
              <Button asChild>
                <Link href="/admin/settings/payment-methods">
                  Manage Payment Methods
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Store Information</CardTitle>
            <CardDescription>Basic information about your ebook store</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Store Name</label>
                <p className="text-sm text-gray-600">Ebook Store</p>
              </div>
              <div>
                <label className="text-sm font-medium">Admin Panel Version</label>
                <p className="text-sm text-gray-600">v1.0.0</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}