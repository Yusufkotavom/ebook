"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import toast from "react-hot-toast"
import { useCurrency } from "@/contexts/currency-context"
import { WhatsAppProductSupport } from "@/components/whatsapp-support"

interface Product {
  id: string
  title: string
  author: string
  publisher: string
  year: number
  price: string
  description: string | null
  image_url: string | null
  download_url: string | null
  is_active: boolean
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

    // Show success toast
    toast.success(
      `📚 "${product.title}" added to cart!`,
      { 
        duration: 2000,
        icon: '🛒'
      }
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
        <p className="text-gray-500">Check back later for new ebooks!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="flex flex-col hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="p-4">
            <div className="aspect-[3/4] relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={product.image_url || "/placeholder.svg?height=300&width=225&query=book cover"}
                alt={product.title}
                fill
                className="object-cover"
              />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-lg font-bold leading-tight line-clamp-2">
                {product.title}
              </CardTitle>
              <CardDescription className="text-sm text-gray-600">
                by {product.author}
              </CardDescription>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {product.publisher}
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {product.year}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="px-4 pb-2 flex-1">
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-3 mb-4">
                {product.description}
              </p>
            )}
            
            {/* WhatsApp Product Support */}
            <div className="mb-4">
              <WhatsAppProductSupport 
                productTitle={product.title}
                className="justify-center"
              />
            </div>
          </CardContent>

          <CardFooter className="p-4 pt-2 mt-auto">
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-black text-lg">
                  {formatPrice(product.price)}
                </span>
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Digital
                </Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => handleAddToCart(product)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  size="sm"
                >
                  <Plus className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Add to Cart</span>
                </Button>
                
                <WhatsAppProductSupport 
                  product={{
                    title: product.title,
                    author: product.author,
                    price: formatPrice(product.price)
                  }}
                />
              </div>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
