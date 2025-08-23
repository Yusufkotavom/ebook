import { createClient } from "@/lib/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { OrdersTable } from "@/components/orders-table"

export default async function AdminOrdersPage() {
  const supabase = await createClient()

  const { data: orders, error } = await supabase
    .from("orders")
    .select(`
      id,
      total_amount,
      status,
      payment_method,
      user_id,
      guest_email,
      created_at,
      updated_at,
      order_items(
        quantity,
        price,
        products(title, author)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
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
          <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and payments</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>Failed to load orders: {error.message}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  const userIds = orders?.filter((order) => order.user_id).map((order) => order.user_id) || []
  let profiles = []

  if (userIds.length > 0) {
    const { data: profilesData } = await supabase.from("profiles").select("id, email, full_name").in("id", userIds)

    profiles = profilesData || []
  }

  const ordersWithProfiles =
    orders?.map((order) => ({
      ...order,
      customer_email: order.guest_email || profiles.find((p) => p.id === order.user_id)?.email || "Unknown",
      customer_name: profiles.find((p) => p.id === order.user_id)?.full_name || null,
    })) || []

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
        <h1 className="text-3xl font-bold text-gray-900">Orders</h1>
        <p className="text-gray-600">Manage customer orders and payments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
          <CardDescription>View and manage customer orders</CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable orders={ordersWithProfiles} />
        </CardContent>
      </Card>
    </div>
  )
}
