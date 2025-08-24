import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"
import { generateDownloadToken } from "@/lib/download-tokens"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const { productId } = await request.json()
    
    if (!productId) {
      return NextResponse.json({ error: "Product ID required" }, { status: 400 })
    }

    // Check if user has active subscription
    const { data: hasSubscription, error: subscriptionError } = await supabase.rpc(
      'has_active_subscription', 
      { user_uuid: user.id }
    )

    if (subscriptionError) {
      console.error("Error checking subscription:", subscriptionError)
      return NextResponse.json({ error: "Failed to verify subscription" }, { status: 500 })
    }

    if (!hasSubscription) {
      return NextResponse.json({ 
        error: "Active subscription required to generate download link" 
      }, { status: 403 })
    }

    // Get user's active subscription details
    const { data: subscriptionInfo, error: subInfoError } = await supabase.rpc(
      'get_active_subscription', 
      { user_uuid: user.id }
    )

    if (subInfoError || !subscriptionInfo || subscriptionInfo.length === 0) {
      return NextResponse.json({ 
        error: "Failed to get subscription details" 
      }, { status: 500 })
    }

    const subscription = subscriptionInfo[0]

    // Verify the product exists and is active
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, title, author, download_url, is_active")
      .eq("id", productId)
      .eq("is_active", true)
      .single()

    if (productError || !product) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (!product.download_url) {
      return NextResponse.json({ error: "Download not available for this book" }, { status: 400 })
    }

    // Generate secure download token
    const downloadToken = generateDownloadToken({
      userId: user.id,
      productId: product.id,
      subscriptionId: subscription.subscription_id
    })

    // Log token generation for analytics
    try {
      await supabase.from("download_token_logs").insert([
        {
          user_id: user.id,
          product_id: product.id,
          subscription_id: subscription.subscription_id,
          token_generated_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString() // 15 minutes from now
        }
      ])
    } catch (logError) {
      console.warn("Failed to log token generation:", logError)
    }

    const expiryMinutes = parseInt(process.env.DOWNLOAD_TOKEN_EXPIRY_MINUTES || '15')

    return NextResponse.json({
      success: true,
      downloadToken,
      expiresIn: expiryMinutes * 60, // seconds
      expiresAt: new Date(Date.now() + expiryMinutes * 60 * 1000).toISOString(),
      product: {
        id: product.id,
        title: product.title,
        author: product.author
      }
    })

  } catch (error) {
    console.error("Generate download token error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}