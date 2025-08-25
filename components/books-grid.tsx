"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Eye, Lock, ShoppingCart, FileText, Calendar, Globe, Hash } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useCurrency } from "@/contexts/currency-context"
import { useCart } from "@/hooks/use-cart"
import toast from "react-hot-toast"

interface Book {
  id: string
  title: string
  author: string
  price: string
  description: string
  image_url: string
  download_url: string
  category: string
  tags: string[]
  isbn: string
  page_count: number
  file_size_mb: number
  language: string
  created_at: string
}

interface BooksGridProps {
  books: Book[]
  hasActiveSubscription: boolean
  isLoggedIn: boolean
}

export function BooksGrid({ books, hasActiveSubscription, isLoggedIn }: BooksGridProps) {
  const [downloadingIds, setDownloadingIds] = useState<Set<string>>(new Set())
  const { formatPrice } = useCurrency()
  const { addToCart } = useCart()

  const handleDownload = async (book: Book) => {
    if (!isLoggedIn) {
      toast.error("Please log in to download books")
      return
    }

    if (!hasActiveSubscription) {
      toast.error("You need an active subscription to download books")
      return
    }

    if (!book.download_url) {
      toast.error("Download not available for this book")
      return
    }

    setDownloadingIds(prev => new Set(prev).add(book.id))
    
    try {
      // Step 1: Generate download token
      const tokenResponse = await fetch('/api/books/generate-download-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ productId: book.id }),
      })

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json()
        throw new Error(errorData.error || 'Failed to generate download link')
      }

      const { downloadToken, expiresIn } = await tokenResponse.json()

      // Show expiry warning
      const expiryMinutes = Math.ceil(expiresIn / 60)
      toast.success(`🔗 Download link generated! Valid for ${expiryMinutes} minutes`, { duration: 3000 })

      // Step 2: Download with token
      const downloadResponse = await fetch(`/api/books/download/${book.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ downloadToken }),
      })

      if (!downloadResponse.ok) {
        const errorData = await downloadResponse.json()
        throw new Error(errorData.error || 'Download failed')
      }

      const blob = await downloadResponse.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${book.title} - ${book.author}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success(`📚 "${book.title}" downloaded successfully!`)
    } catch (error) {
      console.error('Download error:', error)
      toast.error(`Failed to download: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDownloadingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(book.id)
        return newSet
      })
    }
  }

  const handleAddToCart = (book: Book) => {
    addToCart({
      id: book.id,
      title: book.title,
      author: book.author,
      price: parseFloat(book.price),
      image_url: book.image_url,
    })
    toast.success(`📚 "${book.title}" added to cart!`)
  }

  const formatFileSize = (sizeMB: number) => {
    if (sizeMB < 1) {
      return `${Math.round(sizeMB * 1024)} KB`
    }
    return `${sizeMB.toFixed(1)} MB`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {books.map((book) => (
        <Card key={book.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {/* Book Cover */}
          <div className="relative h-48 bg-gray-100">
            {book.image_url ? (
              <Image
                src={book.image_url}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <FileText className="h-16 w-16 text-gray-400" />
              </div>
            )}
            
            {/* Category Badge */}
            {book.category && (
              <Badge className="absolute top-2 left-2 bg-blue-100 text-blue-800">
                {book.category}
              </Badge>
            )}
          </div>

          {/* Book Info */}
          <CardHeader className="pb-2">
            <CardTitle className="text-lg line-clamp-2 h-14">
              {book.title}
            </CardTitle>
            <CardDescription className="text-sm font-medium text-gray-700">
              by {book.author}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Book Details */}
            <div className="space-y-2 text-xs text-gray-600">
              {book.page_count && (
                <div className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {book.page_count} pages
                </div>
              )}
              {book.file_size_mb && (
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {formatFileSize(book.file_size_mb)}
                </div>
              )}
              {book.language && (
                <div className="flex items-center gap-1">
                  <Globe className="h-3 w-3" />
                  {book.language}
                </div>
              )}
              {book.isbn && (
                <div className="flex items-center gap-1">
                  <Hash className="h-3 w-3" />
                  {book.isbn}
                </div>
              )}
            </div>

            {/* Tags */}
            {book.tags && book.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {book.tags.slice(0, 3).map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {book.tags.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{book.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}

            {/* Description */}
            {book.description && (
              <p className="text-sm text-gray-600 line-clamp-2">
                {book.description}
              </p>
            )}

            {/* Price */}
            <div className="text-lg font-bold text-green-600">
              {formatPrice(parseFloat(book.price))}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {hasActiveSubscription ? (
                <Button
                  onClick={() => handleDownload(book)}
                  disabled={downloadingIds.has(book.id)}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  size="sm"
                >
                  {downloadingIds.has(book.id) ? (
                    <>
                      <div className="animate-spin h-3 w-3 border border-white border-t-transparent rounded-full mr-2" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  onClick={() => handleAddToCart(book)}
                  className="flex-1"
                  size="sm"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              )}
              
              <Link href={`/products/${book.id}`}>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {/* Access Status */}
            {!hasActiveSubscription && isLoggedIn && (
              <div className="flex items-center gap-1 text-xs text-orange-600 bg-orange-50 p-2 rounded">
                <Lock className="h-3 w-3" />
                Subscription required for download
              </div>
            )}
            
            {!isLoggedIn && (
              <div className="flex items-center gap-1 text-xs text-gray-600 bg-gray-50 p-2 rounded">
                <Lock className="h-3 w-3" />
                Login required for download
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}