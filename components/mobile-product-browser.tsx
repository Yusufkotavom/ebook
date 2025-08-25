"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Filter, SortAsc, Grid, List } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import { useCurrency } from "@/contexts/currency-context"
import { getPriceRanges } from "@/lib/currency"
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
  is_active: boolean
  created_at: string
}

interface MobileProductBrowserProps {
  products: Product[]
}

export function MobileProductBrowser({ products }: MobileProductBrowserProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState("all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [showFilters, setShowFilters] = useState(false)
  const { addToCart } = useCart()
  const { formatPrice, currencyCode } = useCurrency()
  
  const priceRanges = getPriceRanges(currencyCode)

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      title: product.title,
      author: product.author,
      price: Number.parseFloat(product.price),
      image_url: product.image_url,
    })
  }

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.publisher.toLowerCase().includes(searchTerm.toLowerCase())

      const price = Number.parseFloat(product.price)
      const selectedRange = priceRanges.find(range => range.value === priceRange)
      const matchesPrice = priceRange === "all" || 
        (selectedRange && 
         (selectedRange.min === undefined || price >= selectedRange.min) &&
         (selectedRange.max === undefined || price <= selectedRange.max))

      return matchesSearch && matchesPrice
    })

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "price-low":
          return Number.parseFloat(a.price) - Number.parseFloat(b.price)
        case "price-high":
          return Number.parseFloat(b.price) - Number.parseFloat(a.price)
        case "title":
          return a.title.localeCompare(b.title)
        case "author":
          return a.author.localeCompare(b.author)
        default:
          return 0
      }
    })

    return filtered
  }, [products, searchTerm, sortBy, priceRange, priceRanges])

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Ebooks</h1>
              <p className="text-sm text-gray-500">{filteredAndSortedProducts.length} books found</p>
            </div>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
                className="p-2"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="p-2"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search books, authors, publishers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 py-3"
            />
          </div>

          {/* Filter Toggle */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex-1"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="flex-1">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="title">Title A-Z</SelectItem>
                <SelectItem value="author">Author A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collapsible Filters */}
          {showFilters && (
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Price Range</label>
                  <Select value={priceRange} onValueChange={setPriceRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priceRanges.map((range) => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Products Content */}
      <div className="px-4 py-4">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500 mb-4">Try adjusting your search or filters</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("")
                setPriceRange("all")
              }}
            >
              Clear Filters
            </Button>
          </div>
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredAndSortedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <div className="aspect-[3/4] relative">
                      <Image
                        src={product.image_url || "/placeholder.svg?height=300&width=225&query=book cover"}
                        alt={product.title}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className="bg-black/80 text-white">
                          {formatPrice(product.price)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-semibold text-sm line-clamp-2 mb-1">
                        {product.title}
                      </h3>
                      <p className="text-xs text-gray-600 mb-1">by {product.author}</p>
                      <p className="text-xs text-gray-500">{product.publisher} • {product.year}</p>
                    </CardContent>
                    <CardFooter className="p-3 pt-0 space-y-2">
                      <Button
                        onClick={() => handleAddToCart(product)}
                        className="w-full"
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Add to Cart
                      </Button>
                      <WhatsAppProductSupport
                        productTitle={product.title}
                        className="justify-center"
                      />
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredAndSortedProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex gap-3">
                        <div className="w-16 h-20 relative flex-shrink-0">
                          <Image
                            src={product.image_url || "/placeholder.svg?height=80&width=64&query=book cover"}
                            alt={product.title}
                            fill
                            className="object-cover rounded"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="font-semibold text-sm line-clamp-2">
                              {product.title}
                            </h3>
                            <Badge className="ml-2 bg-black text-white">
                              {formatPrice(product.price)}
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">by {product.author}</p>
                          <p className="text-xs text-gray-500 mb-3">{product.publisher} • {product.year}</p>
                          
                          <div className="flex gap-2">
                            <Button
                              onClick={() => handleAddToCart(product)}
                              size="sm"
                              className="flex-1"
                            >
                              <ShoppingCart className="h-4 w-4 mr-1" />
                              Add to Cart
                            </Button>
                            <WhatsAppProductSupport
                              productTitle={product.title}
                              className="flex-shrink-0"
                            />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Bottom Spacing for Mobile Nav */}
      <div className="h-20 md:h-4"></div>
    </div>
  )
}