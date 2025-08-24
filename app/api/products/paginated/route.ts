import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Pagination parameters
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1"))
    const limit = Math.min(50, Math.max(1, Number.parseInt(searchParams.get("limit") || "24")))
    const offset = (page - 1) * limit
    
    // Filter parameters
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "newest"
    const priceRange = searchParams.get("priceRange") || "all"
    const minPrice = Number.parseFloat(searchParams.get("minPrice") || "0")
    const maxPrice = Number.parseFloat(searchParams.get("maxPrice") || "999999")

    const supabase = await createClient()

    // Build query with filters
    let query = supabase
      .from("products")
      .select("*", { count: "exact" })
      .eq("is_active", true)

    // Apply search filter
    if (search.trim()) {
      query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%,publisher.ilike.%${search}%`)
    }

    // Apply price range filter
    if (priceRange !== "all") {
      if (priceRange === "custom" && minPrice >= 0 && maxPrice > minPrice) {
        query = query.gte("price", minPrice).lte("price", maxPrice)
      } else {
        // Predefined price ranges
        const ranges: Record<string, [number, number]> = {
          "under-50000": [0, 50000],
          "50000-100000": [50000, 100000],
          "100000-200000": [100000, 200000],
          "over-200000": [200000, 999999]
        }
        
        if (ranges[priceRange]) {
          const [min, max] = ranges[priceRange]
          query = query.gte("price", min).lte("price", max)
        }
      }
    }

    // Apply sorting
    switch (sortBy) {
      case "newest":
        query = query.order("created_at", { ascending: false })
        break
      case "oldest":
        query = query.order("created_at", { ascending: true })
        break
      case "price-low":
        query = query.order("price", { ascending: true })
        break
      case "price-high":
        query = query.order("price", { ascending: false })
        break
      case "title-az":
        query = query.order("title", { ascending: true })
        break
      case "title-za":
        query = query.order("title", { ascending: false })
        break
      case "author-az":
        query = query.order("author", { ascending: true })
        break
      default:
        query = query.order("created_at", { ascending: false })
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    const { data: products, error, count } = await query

    if (error) {
      console.error("Error fetching paginated products:", error)
      return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    const response = {
      products: products || [],
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts: count || 0,
        productsPerPage: limit,
        hasNextPage,
        hasPrevPage,
        startIndex: offset + 1,
        endIndex: Math.min(offset + limit, count || 0)
      },
      filters: {
        search,
        sortBy,
        priceRange,
        minPrice,
        maxPrice
      }
    }

    // Add cache headers for better performance
    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600", // 5min cache, 10min stale
        "CDN-Cache-Control": "public, s-maxage=600", // 10min CDN cache
        "Vary": "Accept-Encoding"
      }
    })

  } catch (error) {
    console.error("Paginated products API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}