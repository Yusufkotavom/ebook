"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import { useCurrency } from "@/contexts/currency-context"

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
  const { formatPrice } = useCurrency()

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
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-black mb-2">Books</h2>
        <p className="text-gray-600 text-sm">{products.length} available</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="border-0 shadow-none bg-white">
            <CardContent className="p-0">
              <div className="flex gap-4">
                <div className="w-20 h-28 flex-shrink-0">
                  <div className="w-full h-full bg-gray-100 rounded overflow-hidden">
                    <Image
                      src={product.image_url || "/placeholder.svg?height=112&width=80&query=book cover"}
                      alt={product.title}
                      width={80}
                      height={112}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-black text-sm leading-tight mb-1 line-clamp-2">
                    {product.title}
                  </h3>

                  <p className="text-gray-600 text-xs mb-2">by {product.author}</p>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-gray-500">{product.publisher}</span>
                    <span className="text-xs text-gray-500">{product.year}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-bold text-black text-lg">
                      {formatPrice(product.price)}
                    </span>
                    
                    <Button 
                      size="sm" 
                      className="bg-black text-white hover:bg-gray-800 h-8 px-3"
                      onClick={() => handleAddToCart(product)}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {products.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No books available.</p>
        </div>
      )}
    </div>
  )
}
