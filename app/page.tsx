import { createClient } from "@/lib/server"
import { HeroSection } from "@/components/hero-section"
import { ProductSearch } from "@/components/product-search"
import { ProductGrid } from "@/components/product-grid"
import { FloatingCart } from "@/components/floating-cart"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen } from "lucide-react"
import Link from "next/link"

export default async function HomePage() {
  const supabase = await createClient()

  // Get total count for display
  const { count: totalProducts } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("is_active", true)

  // Get only first 50 products for homepage
  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) {
    console.error("Error fetching products:", error)
  }

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />

      <main className="container mx-auto px-4 py-8">
        <ProductSearch />
        
        {/* Featured Books Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Featured Books</h2>
              <p className="text-gray-600">
                Discover our latest collection of {totalProducts?.toLocaleString() || '5000+'} ebooks
              </p>
            </div>
            <Link href="/products">
              <Button className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                View All Books
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <ProductGrid products={products || []} />
          
          {/* Call to Action for All Books */}
          <div className="text-center mt-12 p-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border">
            <div className="max-w-md mx-auto">
              <BookOpen className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Explore Our Complete Library
              </h3>
              <p className="text-gray-600 mb-6">
                Browse through {totalProducts?.toLocaleString() || '5000+'} ebooks with advanced search, filters, and sorting options.
              </p>
              <Link href="/products">
                <Button size="lg" className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Browse All {totalProducts?.toLocaleString() || '5000+'} Books
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>

      <FloatingCart />
    </div>
  )
}
