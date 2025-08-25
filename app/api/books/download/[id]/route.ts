import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"
import { verifyDownloadToken } from "@/lib/download-tokens"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient()
    
    // Get download token from request body
    const { downloadToken } = await request.json()
    
    if (!downloadToken) {
      return NextResponse.json({ error: "Download token required" }, { status: 400 })
    }

    // Verify the download token
    let tokenPayload
    try {
      tokenPayload = verifyDownloadToken(downloadToken)
    } catch (error) {
      return NextResponse.json({ 
        error: error instanceof Error ? error.message : "Invalid download token" 
      }, { status: 401 })
    }

    // Verify token matches the requested product
    if (tokenPayload.productId !== params.id) {
      return NextResponse.json({ error: "Token does not match requested product" }, { status: 403 })
    }

    // Get the current user and verify it matches token
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== tokenPayload.userId) {
      return NextResponse.json({ error: "Authentication mismatch" }, { status: 401 })
    }

    // Double-check user still has active subscription (security measure)
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
        error: "Subscription no longer active" 
      }, { status: 403 })
    }

    // Get the book details
    const { data: book, error: bookError } = await supabase
      .from("products")
      .select("id, title, author, download_url, is_active")
      .eq("id", params.id)
      .eq("is_active", true)
      .single()

    if (bookError || !book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 })
    }

    if (!book.download_url) {
      return NextResponse.json({ error: "Download not available for this book" }, { status: 400 })
    }

    // Log the download for analytics
    try {
      await supabase.from("download_logs").insert([
        {
          user_id: user.id,
          product_id: book.id,
          subscription_id: tokenPayload.subscriptionId,
          download_token_used: downloadToken.substring(0, 20) + "...", // Log partial token for debugging
          downloaded_at: new Date().toISOString()
        }
      ])
    } catch (logError) {
      // Don't fail the download if logging fails
      console.warn("Failed to log download:", logError)
    }

    // For demo purposes, we'll create a simple PDF response
    // In production, you would fetch the actual file from your storage
    const fileName = `${book.title} - ${book.author}.pdf`
    
    // If you have actual file URLs, you can proxy them:
    if (book.download_url.startsWith('http')) {
      try {
        const fileResponse = await fetch(book.download_url)
        if (!fileResponse.ok) {
          throw new Error('Failed to fetch file')
        }
        
        const fileBuffer = await fileResponse.arrayBuffer()
        
        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': fileBuffer.byteLength.toString(),
          },
        })
      } catch (fetchError) {
        console.error("Error fetching file:", fetchError)
        return NextResponse.json({ error: "Failed to fetch file" }, { status: 500 })
      }
    }

    // Demo: Create a simple PDF response for testing
    const demoContent = `This is a demo download for: ${book.title} by ${book.author}`
    
    return new NextResponse(demoContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': demoContent.length.toString(),
      },
    })

  } catch (error) {
    console.error("Download API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Handle GET requests (for direct links)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Redirect GET requests to POST for security
  return NextResponse.json({ 
    error: "Use POST method for downloads" 
  }, { status: 405 })
}