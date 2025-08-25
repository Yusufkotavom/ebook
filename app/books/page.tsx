import { PaginatedProductBrowser } from "@/components/paginated-product-browser"
import { FloatingCart } from "@/components/floating-cart"

export default function BooksPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <PaginatedProductBrowser />
      <FloatingCart />
    </div>
  )
}