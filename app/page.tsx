import { createClient } from "@/lib/server"
import { HeroSection } from "@/components/hero-section"
import { ProductSearch } from "@/components/product-search"
import { ProductGrid } from "@/components/product-grid"
import { FloatingCart } from "@/components/floating-cart"

export default async function HomePage() {
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

      <HeroSection />

      <main className="container mx-auto px-4 py-8">
        <ProductSearch />
        <ProductGrid products={products || []} />
      </main>

      <FloatingCart />
    </div>
  )
}
