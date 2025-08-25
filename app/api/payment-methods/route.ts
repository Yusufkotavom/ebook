import { createClient } from "@/lib/server"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  const supabase = await createClient()

  try {
    const { data: paymentMethods, error } = await supabase
      .from("payment_methods")
      .select("*")
      .order("display_order", { ascending: true })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(paymentMethods)
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    
    const { data: paymentMethod, error } = await supabase
      .from("payment_methods")
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json(paymentMethod, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}