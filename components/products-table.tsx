"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { createClient } from "@/lib/client"
import toast from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useCurrency } from "@/contexts/currency-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Product {
  id: string
  title: string
  author: string
  publisher: string
  year: number
  price: string
  image_url: string | null
  is_active: boolean
  created_at: string
}

interface ProductsTableProps {
  products: Product[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const [deleteProductId, setDeleteProductId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { formatPrice } = useCurrency()

  const handleDeleteProduct = async (productId: string) => {
    setIsDeleting(true)
    
    // Find the product to get its title for the toast
    const product = products.find(p => p.id === productId)
    const productTitle = product?.title || "Product"

    // Show loading toast
    const loadingToast = toast.loading(`Deleting "${productTitle}"...`)

    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId)

      if (error) throw error

      // Success toast
      toast.success(
        `🗑️ Product "${productTitle}" deleted successfully!`,
        { 
          duration: 3000,
          id: loadingToast 
        }
      )

      // Refresh the page to update the products list
      router.refresh()
      setDeleteProductId(null)
    } catch (error) {
      // Error toast
      toast.error(
        `Failed to delete product: ${error instanceof Error ? error.message : "Unknown error"}`,
        { 
          duration: 5000,
          id: loadingToast 
        }
      )
      
      console.error("Error deleting product:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Product</TableHead>
          <TableHead>Author</TableHead>
          <TableHead>Publisher</TableHead>
          <TableHead>Year</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id}>
            <TableCell>
              <div className="flex items-center space-x-3">
                <div className="relative h-12 w-8">
                  <Image
                    src={product.image_url || "/placeholder.svg?height=48&width=32"}
                    alt={product.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
                <div>
                  <p className="font-medium">{product.title}</p>
                </div>
              </div>
            </TableCell>
            <TableCell>{product.author}</TableCell>
            <TableCell>{product.publisher}</TableCell>
            <TableCell>{product.year}</TableCell>
            <TableCell>{formatPrice(product.price)}</TableCell>
            <TableCell>
              <Badge variant={product.is_active ? "default" : "secondary"}>
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
            </TableCell>
            <TableCell>
              <div className="flex space-x-2">
                <Link href={`/admin/products/edit/${product.id}`}>
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                </Link>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setDeleteProductId(product.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
                  ))}
        </TableBody>
    </Table>

    <Dialog open={!!deleteProductId} onOpenChange={() => setDeleteProductId(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Product</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this product? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setDeleteProductId(null)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => deleteProductId && handleDeleteProduct(deleteProductId)}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  )
}
