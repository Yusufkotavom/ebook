"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

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
  return (
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
            <TableCell>${Number.parseFloat(product.price).toFixed(2)}</TableCell>
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
                <Button variant="outline" size="sm">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
