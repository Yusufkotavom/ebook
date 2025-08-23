import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreditCard, AlertCircle } from "lucide-react"

export default function PaymentsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Payment Methods</h1>
        <p className="text-gray-600">Manage your payment preferences</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <CardTitle>Manual Payment Processing</CardTitle>
          </div>
          <CardDescription>We currently process payments manually for security and flexibility.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">How Payment Works</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Place your order with your email address</li>
                <li>• Receive payment instructions via email</li>
                <li>• Complete payment using your preferred method</li>
                <li>• Get download links once payment is confirmed</li>
              </ul>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Accepted Payment Methods</h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Bank Transfer</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Digital Wallets</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Cryptocurrency</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
