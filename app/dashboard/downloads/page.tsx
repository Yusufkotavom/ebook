import { createClient } from "@/lib/server"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, BookOpen } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default async function DownloadsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  // Get all paid orders first, then join with order_items and products
  const { data: downloads, error } = await supabase
    .from("orders")
    .select(
      `
      id,
      status,
      created_at,
      order_items(
        id,
        quantity,
        products(
          id,
          title,
          author,
          publisher,
          image_url,
          download_url
        )
      )
    `,
    )
    .eq("user_id", user.id)
    .eq("status", "paid")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching downloads:", error)
  }

  const downloadableItems =
    downloads?.flatMap(
      (order) =>
        order.order_items
          ?.filter((item) => item.products?.download_url)
          .map((item) => ({
            ...item,
            order_created_at: order.created_at,
          })) || [],
    ) || []

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Downloads</h1>
        <p className="text-gray-600">Access your purchased ebooks</p>
      </div>

      {downloadableItems && downloadableItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {downloadableItems.map((item) => (
            <Card key={item.id} className="group hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="relative h-20 w-16 flex-shrink-0">
                    <Image
                      src={item.products?.image_url || "/placeholder.svg?height=80&width=64&query=book cover"}
                      alt={item.products?.title || "Book cover"}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 line-clamp-2">{item.products?.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">by {item.products?.author}</p>
                    <p className="text-xs text-gray-500 mt-1">{item.products?.publisher}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Purchased: {new Date(item.order_created_at || "").toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex space-x-2">
                  {item.products?.download_url && (
                    <Link href={item.products.download_url} target="_blank" className="flex-1">
                      <Button className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </Link>
                  )}
                  <Button variant="outline" size="icon">
                    <BookOpen className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">No downloads available yet.</p>
            <p className="text-sm text-gray-400 mb-6">
              Purchase some ebooks and they&apos;ll appear here once payment is confirmed.
            </p>
            <Link href="/">
              <Button>Browse Catalog</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
