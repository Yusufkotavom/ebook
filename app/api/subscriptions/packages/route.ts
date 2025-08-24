import { createClient } from "@/lib/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: packages, error } = await supabase
      .from("subscription_packages")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })

    if (error) {
      console.error("Error fetching subscription packages:", error)
      return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 })
    }

    return NextResponse.json({ packages })
  } catch (error) {
    console.error("Error in subscription packages API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, duration_days, price, features, is_featured, sort_order } = body

    const { data: newPackage, error } = await supabase
      .from("subscription_packages")
      .insert([
        {
          name,
          description,
          duration_days,
          price,
          features,
          is_featured: is_featured || false,
          sort_order: sort_order || 0
        }
      ])
      .select()
      .single()

    if (error) {
      console.error("Error creating subscription package:", error)
      return NextResponse.json({ error: "Failed to create package" }, { status: 500 })
    }

    return NextResponse.json({ package: newPackage })
  } catch (error) {
    console.error("Error in create subscription package API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}