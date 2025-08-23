"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Eye } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"

interface Product {
  id: string
  title: string
  author: string
  publisher: string
  year: number
  price: string
  description: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
}

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  const { addToCart } = useCart()

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      title: product.title,
      author: product.author,
      price: Number.parseFloat(product.price),
      image_url: product.image_url,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Featured Books</h2>
        <p className="text-gray-600">{products.length} books available</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-4">
              <div className="aspect-[3/4] relative mb-4 overflow-hidden rounded-lg bg-gray-100">
                <Image
                  src={product.image_url || "/placeholder.svg?height=300&width=225&query=book cover"}
                  alt={product.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute top-2 right-2">
                  <Badge variant="secondary" className="bg-white/90">
                    ${Number.parseFloat(product.price).toFixed(2)}
                  </Badge>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                  {product.title}
                </h3>

                <p className="text-sm text-gray-600">by {product.author}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>{product.publisher}</span>
                  <span>{product.year}</span>
                </div>

                {product.description && <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>}

                <div className="flex gap-2 pt-2">
                  <Button size="sm" className="flex-1" onClick={() => handleAddToCart(product)}>
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No books found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
