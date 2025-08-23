"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, ShoppingCart, Filter } from "lucide-react"
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

interface ProductTableViewProps {
  products: Product[]
}

export function ProductTableView({ products }: ProductTableViewProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("newest")
  const [priceRange, setPriceRange] = useState("all")
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

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = products.filter((product) => {
      const matchesSearch =
        product.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.publisher.toLowerCase().includes(searchTerm.toLowerCase())

      const price = Number.parseFloat(product.price)
      const matchesPrice =
        priceRange === "all" ||
        (priceRange === "0-20" && price <= 20) ||
        (priceRange === "20-40" && price > 20 && price <= 40) ||
        (priceRange === "40-60" && price > 40 && price <= 60) ||
        (priceRange === "60+" && price > 60)

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
  }, [products, searchTerm, sortBy, priceRange])

  return (
    <div className="space-y-6">
      {/* Search and Filter Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search books, authors, publishers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex gap-4 items-center">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="title">Title A-Z</SelectItem>
                  <SelectItem value="author">Author A-Z</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priceRange} onValueChange={setPriceRange}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Price Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Prices</SelectItem>
                  <SelectItem value="0-20">$0 - $20</SelectItem>
                  <SelectItem value="20-40">$20 - $40</SelectItem>
                  <SelectItem value="40-60">$40 - $60</SelectItem>
                  <SelectItem value="60+">$60+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-gray-600">
          Showing {filteredAndSortedProducts.length} of {products.length} products
        </p>
      </div>

      {/* Products Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Product</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Publisher</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Price</TableHead>
                <TableHead className="text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedProducts.map((product) => (
                <TableRow key={product.id} className="hover:bg-gray-50">
                  <TableCell>
                    <div className="flex items-center space-x-4">
                      <div className="relative h-16 w-12 flex-shrink-0">
                        <Image
                          src={product.image_url || "/placeholder.svg?height=64&width=48&query=book cover"}
                          alt={product.title}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-medium text-gray-900 line-clamp-2">{product.title}</h3>
                        {product.description && (
                          <p className="text-sm text-gray-500 line-clamp-1 mt-1">{product.description}</p>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.author}</TableCell>
                  <TableCell className="text-gray-600">{product.publisher}</TableCell>
                  <TableCell className="text-gray-600">{product.year}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-semibold">
                      ${Number.parseFloat(product.price).toFixed(2)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button size="sm" onClick={() => handleAddToCart(product)} className="w-full max-w-[120px]">
                      <ShoppingCart className="h-4 w-4 mr-2" />
                      Add to Cart
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredAndSortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
              <Button
                variant="outline"
                className="mt-4 bg-transparent"
                onClick={() => {
                  setSearchTerm("")
                  setPriceRange("all")
                  setSortBy("newest")
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
