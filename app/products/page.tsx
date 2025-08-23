import { createClient } from "@/lib/server"
import { ProductTableView } from "@/components/product-table-view"
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
    <div className="min-h-screen bg-background">


      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">All Products</h1>
          <p className="text-gray-600">Browse our complete ebook collection</p>
        </div>

        <ProductTableView products={products || []} />
      </main>

      <FloatingCart />
    </div>
  )
}
