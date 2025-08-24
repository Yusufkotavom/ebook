import { createClient } from "@/lib/server"
import { MobileProductBrowser } from "@/components/mobile-product-browser"
import { FloatingCart } from "@/components/floating-cart"

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <MobileProductBrowser products={products || []} />
      <FloatingCart />
    </div>
  )
}
