"use client"

import type React from "react"

import { createClient } from "@/lib/client"
import toast from "react-hot-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function AddProductForm() {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    publisher: "",
    year: new Date().getFullYear(),
    price: "",
    description: "",
    image_url: "",
    download_url: "",
    is_active: true,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    // Show loading toast
    const loadingToast = toast.loading("Creating product...")

    const supabase = createClient()

    try {
      const { error } = await supabase.from("products").insert([
        {
          ...formData,
          price: Number.parseFloat(formData.price),
        },
      ])

      if (error) throw error

      // Success toast
      toast.success(
        `📚 Product "${formData.title}" created successfully!`,
        { 
          duration: 3000,
          id: loadingToast 
        }
      )

      router.push("/admin/products")
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "An error occurred"
      
      // Error toast
      toast.error(
        `Failed to create product: ${errorMessage}`,
        { 
          duration: 5000,
          id: loadingToast 
        }
      )
      
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input id="title" required value={formData.title} onChange={(e) => handleChange("title", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="author">Author *</Label>
          <Input
            id="author"
            required
            value={formData.author}
            onChange={(e) => handleChange("author", e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="publisher">Publisher *</Label>
          <Input
            id="publisher"
            required
            value={formData.publisher}
            onChange={(e) => handleChange("publisher", e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="year">Year *</Label>
          <Input
            id="year"
            type="number"
            required
            value={formData.year}
            onChange={(e) => handleChange("year", Number.parseInt(e.target.value))}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="price">Price *</Label>
        <Input
          id="price"
          type="number"
          step="0.01"
          required
          value={formData.price}
          onChange={(e) => handleChange("price", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleChange("description", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          value={formData.image_url}
          onChange={(e) => handleChange("image_url", e.target.value)}
        />
      </div>

      <div>
        <Label htmlFor="download_url">Download URL</Label>
        <Input
          id="download_url"
          type="url"
          value={formData.download_url}
          onChange={(e) => handleChange("download_url", e.target.value)}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_active"
          checked={formData.is_active}
          onCheckedChange={(checked) => handleChange("is_active", checked)}
        />
        <Label htmlFor="is_active">Active</Label>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Adding..." : "Add Product"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.push("/admin/products")}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
