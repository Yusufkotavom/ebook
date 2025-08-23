"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { ShoppingCart, Plus, Minus, Trash2 } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import Image from "next/image"
import Link from "next/link"

export function FloatingCart() {
  const { state, updateQuantity, removeFromCart } = useCart()

  if (state.itemCount === 0) {
    return null
  }

  return (
    <div className="floating-cart">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="lg" className="rounded-full shadow-lg relative">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            <Badge className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 flex items-center justify-center">
              {state.itemCount}
            </Badge>
          </Button>
        </SheetTrigger>

        <SheetContent className="w-full sm:max-w-lg flex flex-col">
          <SheetHeader className="flex-shrink-0">
            <SheetTitle>Shopping Cart</SheetTitle>
            <SheetDescription>
              {state.itemCount} item{state.itemCount !== 1 ? "s" : ""} in your cart
            </SheetDescription>
          </SheetHeader>

          {/* Scrollable cart items area */}
          <div className="flex-1 overflow-y-auto mt-6 pr-2">
            <div className="space-y-4">
              {state.items.map((item) => (
                <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                  <div className="relative h-16 w-12 flex-shrink-0">
                    <Image
                      src={item.image_url || "/placeholder.svg?height=64&width=48&query=book cover"}
                      alt={item.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm line-clamp-2">{item.title}</h4>
                    <p className="text-xs text-gray-500">by {item.author}</p>
                    <p className="text-sm font-medium">${item.price.toFixed(2)}</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity - 1)}>
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <Button size="sm" variant="outline" onClick={() => updateQuantity(item.id, item.quantity + 1)}>
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Fixed footer with total and checkout button */}
          <div className="flex-shrink-0 mt-6 pt-4 border-t space-y-4">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Total:</span>
              <span>${state.total.toFixed(2)}</span>
            </div>

            <Link href="/checkout" className="block">
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </Link>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
