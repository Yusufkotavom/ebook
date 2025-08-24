"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { 
  Search, 
  SlidersHorizontal, 
  Grid3X3, 
  List, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Eye,
  Loader2,
  BookOpen,
  Filter
} from "lucide-react"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import toast from "react-hot-toast"
import { useCurrency } from "@/contexts/currency-context"
import { WhatsAppProductSupport } from "@/components/whatsapp-support"
import { Spinner } from "@/components/ui/spinner"

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

interface PaginationInfo {
  currentPage: number
  totalPages: number
  totalProducts: number
  productsPerPage: number
  hasNextPage: boolean
  hasPrevPage: boolean
  startIndex: number
  endIndex: number
}

interface ProductResponse {
  products: Product[]
  pagination: PaginationInfo
  filters: {
    search: string
    sortBy: string
    priceRange: string
    minPrice: number
    maxPrice: number
  }
}

// Cache for product data
const productCache = new Map<string, { data: ProductResponse; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export function PaginatedProductBrowser() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { addToCart } = useCart()
  const { formatPrice, currencyCode } = useCurrency()

  // State
  const [products, setProducts] = useState<Product[]>([])
  const [pagination, setPagination] = useState<PaginationInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState(searchParams.get("search") || "")
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "newest")
  const [priceRange, setPriceRange] = useState(searchParams.get("priceRange") || "all")
  const [viewMode, setViewMode] = useState<"grid" | "list">("list")
  const [showFilters, setShowFilters] = useState(false)
  
  // Current page
  const currentPage = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))

  // Generate cache key for current parameters
  const getCacheKey = useCallback((page: number, search: string, sort: string, price: string) => {
    return `products-${page}-${search}-${sort}-${price}`
  }, [])

  // Fetch products with caching
  const fetchProducts = useCallback(async (page: number, search: string, sort: string, price: string, useCache = true) => {
    const cacheKey = getCacheKey(page, search, sort, price)
    
    // Check cache first
    if (useCache) {
      const cached = productCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
        setProducts(cached.data.products)
        setPagination(cached.data.pagination)
        setLoading(false)
        setInitialLoad(false)
        return
      }
    }

    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "24",
        search: search,
        sortBy: sort,
        priceRange: price
      })

      const response = await fetch(`/api/products/paginated?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ProductResponse = await response.json()

      // Cache the response
      productCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      })

      setProducts(data.products)
      setPagination(data.pagination)
      setError(null)

    } catch (err) {
      console.error("Error fetching products:", err)
      setError(err instanceof Error ? err.message : "Failed to load products")
      setProducts([])
      setPagination(null)
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }, [getCacheKey])

  // Update URL with current filters
  const updateURL = useCallback((page: number, search: string, sort: string, price: string) => {
    const params = new URLSearchParams()
    
    if (page > 1) params.set("page", page.toString())
    if (search) params.set("search", search)
    if (sort !== "newest") params.set("sortBy", sort)
    if (price !== "all") params.set("priceRange", price)

    const newURL = `/products${params.toString() ? `?${params.toString()}` : ""}`
    router.push(newURL, { scroll: false })
  }, [router])

  // Handle search on Enter key only (removed debouncing for simpler queries)
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchTerm !== (searchParams.get("search") || "")) {
      updateURL(1, searchTerm, sortBy, priceRange)
    }
  }

  // Fetch products when parameters change
  useEffect(() => {
    fetchProducts(currentPage, searchTerm, sortBy, priceRange)
  }, [currentPage, searchTerm, sortBy, priceRange, fetchProducts])

  // Handle filter changes
  const handleSortChange = (newSort: string) => {
    setSortBy(newSort)
    updateURL(1, searchTerm, newSort, priceRange)
  }

  const handlePriceRangeChange = (newRange: string) => {
    setPriceRange(newRange)
    updateURL(1, searchTerm, sortBy, newRange)
  }

  const handlePageChange = (newPage: number) => {
    updateURL(newPage, searchTerm, sortBy, priceRange)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

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

  // Price ranges based on currency
  const priceRanges = useMemo(() => {
    const ranges = {
      IDR: [
        { value: "all", label: "All Prices" },
        { value: "under-50000", label: "Under Rp 50,000" },
        { value: "50000-100000", label: "Rp 50,000 - Rp 100,000" },
        { value: "100000-200000", label: "Rp 100,000 - Rp 200,000" },
        { value: "over-200000", label: "Over Rp 200,000" }
      ],
      USD: [
        { value: "all", label: "All Prices" },
        { value: "under-50000", label: "Under $50" },
        { value: "50000-100000", label: "$50 - $100" },
        { value: "100000-200000", label: "$100 - $200" },
        { value: "over-200000", label: "Over $200" }
      ]
    }
    return ranges[currencyCode as keyof typeof ranges] || ranges.IDR
  }, [currencyCode])

  // Product card component
  const ProductCard = ({ product }: { product: Product }) => (
    <Card className="flex flex-col hover:shadow-lg transition-all duration-200 group">
      <CardHeader className="p-4">
        <div className="aspect-[3/4] relative mb-4 bg-gray-100 rounded-lg overflow-hidden">
          <Image
            src={product.image_url || "/placeholder.svg?height=300&width=225&query=book cover"}
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          />
        </div>
        <div className="space-y-2">
          <Badge variant="secondary" className="text-xs">{product.year}</Badge>
          <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
            {product.title}
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            by {product.author}
          </CardDescription>
          <div className="text-sm text-gray-500">
            {product.publisher}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 pt-0 flex-1">
        {product.description && (
          <p className="text-sm text-gray-600 line-clamp-3">
            {product.description}
          </p>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0 flex flex-col gap-3">
        <div className="flex items-center justify-between w-full">
          <span className="text-xl font-bold text-blue-600">
            {formatPrice(product.price)}
          </span>
        </div>
        
        <div className="flex gap-2 w-full">
          <Button
            onClick={() => handleAddToCart(product)}
            className="flex-1"
            size="sm"
          >
            <Plus className="h-4 w-4 sm:mr-1" />
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
      </CardFooter>
    </Card>
  )

  // Loading skeleton
  const ProductSkeleton = () => (
    <Card className="flex flex-col">
      <CardHeader className="p-4">
        <Skeleton className="aspect-[3/4] w-full rounded-lg mb-4" />
        <Skeleton className="h-4 w-16 mb-2" />
        <Skeleton className="h-6 w-full mb-2" />
        <Skeleton className="h-4 w-3/4 mb-1" />
        <Skeleton className="h-4 w-1/2" />
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1">
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <div className="flex gap-2 w-full">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
        </div>
      </CardFooter>
    </Card>
  )

  // Pagination component
  const PaginationControls = () => {
    if (!pagination || pagination.totalPages <= 1) return null

    const maxVisiblePages = 5
    const startPage = Math.max(1, pagination.currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(pagination.totalPages, startPage + maxVisiblePages - 1)
    const adjustedStartPage = Math.max(1, endPage - maxVisiblePages + 1)

    return (
      <div className="flex flex-col items-center gap-4 mt-8 mb-4">
        {/* Page info */}
        <div className="text-sm text-gray-600 text-center">
          Showing {pagination.startIndex}-{pagination.endIndex} of {pagination.totalProducts.toLocaleString()} products
        </div>

        {/* Pagination buttons */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={!pagination.hasPrevPage}
            className="min-w-0"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline ml-1">Previous</span>
          </Button>

          {adjustedStartPage > 1 && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(1)}
              >
                1
              </Button>
              {adjustedStartPage > 2 && <span className="text-gray-400">...</span>}
            </>
          )}

          {Array.from({ length: endPage - adjustedStartPage + 1 }, (_, i) => {
            const page = adjustedStartPage + i
            return (
              <Button
                key={page}
                variant={page === pagination.currentPage ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageChange(page)}
                className="min-w-[40px]"
              >
                {page}
              </Button>
            )
          })}

          {endPage < pagination.totalPages && (
            <>
              {endPage < pagination.totalPages - 1 && <span className="text-gray-400">...</span>}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(pagination.totalPages)}
              >
                {pagination.totalPages}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="min-w-0"
          >
            <span className="hidden sm:inline mr-1">Next</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Mobile page input */}
        <div className="flex items-center gap-2 text-sm">
          <span>Page</span>
          <Input
            type="number"
            min={1}
            max={pagination.totalPages}
            value={pagination.currentPage}
            onChange={(e) => {
              const page = Math.max(1, Math.min(pagination.totalPages, Number.parseInt(e.target.value) || 1))
              handlePageChange(page)
            }}
            className="w-16 h-8 text-center"
          />
          <span>of {pagination.totalPages}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Sticky Header */}
      <div className="bg-white border-b sticky top-16 z-30">
        <div className="px-4 py-4">
          {/* Title and Stats */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">All Books</h1>
              {pagination && (
                <p className="text-sm text-gray-600">
                  {pagination.totalProducts.toLocaleString()} books available
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
              >
                {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline ml-1">Filters</span>
              </Button>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search books, authors, publishers... (Press Enter to search)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </form>

          {/* Filters */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="text-sm font-medium mb-1 block">Sort by</label>
                <Select value={sortBy} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="title-az">Title: A to Z</SelectItem>
                    <SelectItem value="title-za">Title: Z to A</SelectItem>
                    <SelectItem value="author-az">Author: A to Z</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Price Range</label>
                <Select value={priceRange} onValueChange={handlePriceRangeChange}>
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
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4">
        {error && (
          <div className="text-center py-12">
            <div className="text-red-500 mb-4">⚠️ {error}</div>
            <Button onClick={() => fetchProducts(currentPage, searchTerm, sortBy, priceRange, false)}>
              Try Again
            </Button>
          </div>
        )}

        {initialLoad && loading && (
          <div className="text-center py-12">
            <Spinner size="page" text="Loading books..." />
          </div>
        )}

        {!initialLoad && loading && (
          <div className="text-center py-8">
            <Spinner size="text" text="Updating results..." />
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No books found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? `No results for "${searchTerm}"` : "Try adjusting your filters"}
            </p>
            {searchTerm && (
              <Button onClick={() => setSearchTerm("")}>
                Clear Search
              </Button>
            )}
          </div>
        )}

        {!initialLoad && !loading && products.length > 0 && (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {products.map((product) => (
                  <Card key={product.id} className="p-4 hover:shadow-md transition-shadow">
                    <div className="flex gap-4">
                      <div className="w-20 h-28 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        <Image
                          src={product.image_url || "/placeholder.svg?height=112&width=80&query=book"}
                          alt={product.title}
                          width={80}
                          height={112}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-2">{product.title}</h3>
                            <p className="text-gray-600">by {product.author}</p>
                            <p className="text-sm text-gray-500">{product.publisher} ({product.year})</p>
                            {product.description && (
                              <p className="text-sm text-gray-600 line-clamp-2 mt-2">{product.description}</p>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-xl font-bold text-blue-600 mb-2">
                              {formatPrice(product.price)}
                            </div>
                                                         <div className="flex gap-1">
                               <Button
                                 onClick={() => handleAddToCart(product)}
                                 size="sm"
                                 className="flex-1"
                               >
                                 <Plus className="h-4 w-4 sm:mr-1" />
                                 <span className="hidden sm:inline">Add</span>
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
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}

            <PaginationControls />
          </>
        )}

        {/* Loading skeletons during pagination */}
        {!initialLoad && loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mt-4 opacity-50">
            {Array.from({ length: 8 }, (_, i) => (
              <ProductSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        )}
      </div>

      {/* Bottom spacing for mobile nav */}
      <div className="h-20 md:h-4"></div>
    </div>
  )
}