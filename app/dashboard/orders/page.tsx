import { createClient } from "@/lib/server"
import { DashboardOrdersList } from "@/components/dashboard-orders-list"

export default async function OrdersPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: orders, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      total_amount,
      status,
      payment_method,
      created_at,
      order_items(
        id,
        quantity,
        price,
        products(
          id,
          title,
          author,
          download_url
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching orders:", error)
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-1">View and manage your ebook purchases</p>
      </div>

      <DashboardOrdersList orders={orders || []} />
    </div>
  )
}
