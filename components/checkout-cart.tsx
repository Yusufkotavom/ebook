"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Minus, Trash2, ShoppingCart } from "lucide-react"
import Image from "next/image"
import { useCart } from "@/hooks/use-cart"
import toast from "react-hot-toast"
import { useCurrency } from "@/contexts/currency-context"

interface CartItem {
  id: string
  title: string
  author: string
  price: number
  quantity: number
  image_url: string | null
  selected?: boolean
}

interface CheckoutCartProps {
  onSelectedItemsChange: (selectedItems: CartItem[], total: number) => void
}

export function CheckoutCart({ onSelectedItemsChange }: CheckoutCartProps) {
  const { state, updateQuantity, removeFromCart } = useCart()
  const { formatPrice } = useCurrency()
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Initialize all items as selected by default
  useEffect(() => {
    if (state.items.length > 0) {
      const allItemIds = new Set(state.items.map(item => item.id))
      setSelectedItems(allItemIds)
    }
  }, [state.items])

  // Calculate selected items total and notify parent
  useEffect(() => {
    const selected = state.items.filter(item => selectedItems.has(item.id))
    const total = selected.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    onSelectedItemsChange(selected, total)
  }, [selectedItems, state.items, onSelectedItemsChange])

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const allItemIds = new Set(state.items.map(item => item.id))
      setSelectedItems(allItemIds)
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const item = state.items.find(item => item.id === itemId)
    
    if (newQuantity > 0) {
      updateQuantity(itemId, newQuantity)
      
      // Show quantity update toast
      if (item) {
        toast.success(
          `Updated "${item.title}" quantity to ${newQuantity}`,
          { 
            duration: 1500,
            icon: '📝'
          }
        )
      }
    } else {
      removeFromCart(itemId)
      
      // Show removal toast
      if (item) {
        toast.success(
          `🗑️ "${item.title}" removed from cart`,
          { 
            duration: 2000
          }
        )
      }
      
      // Remove from selected if deleted
      const newSelected = new Set(selectedItems)
      newSelected.delete(itemId)
      setSelectedItems(newSelected)
    }
  }

  const selectedItemsCount = selectedItems.size
  const selectedTotal = state.items
    .filter(item => selectedItems.has(item.id))
    .reduce((sum, item) => sum + (item.price * item.quantity), 0)

  if (state.items.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <ShoppingCart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <Button onClick={() => window.location.href = "/products"}>
            Browse Books
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Order Summary</CardTitle>
            <CardDescription>
              {selectedItemsCount} of {state.items.length} items selected
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="select-all"
              checked={selectedItemsCount === state.items.length}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
              Select All
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {state.items.map((item) => (
            <div 
              key={item.id} 
              className={`p-4 rounded-lg border transition-colors ${
                selectedItems.has(item.id) 
                  ? 'border-blue-200 bg-blue-50' 
                  : 'border-gray-200 bg-gray-50'
              }`}
            >
              <div className="flex items-start space-x-4">
                {/* Checkbox */}
                <div className="pt-2">
                  <Checkbox
                    checked={selectedItems.has(item.id)}
                    onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                  />
                </div>

                {/* Book Cover */}
                <div className="relative h-16 w-12 flex-shrink-0">
                  <Image
                    src={item.image_url || "/placeholder.svg?height=64&width=48&query=book cover"}
                    alt={item.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>

                {/* Book Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-sm leading-tight">{item.title}</h4>
                  <p className="text-xs text-gray-500 mt-1">by {item.author}</p>
                  
                  {/* Price per unit */}
                  <p className="text-sm text-gray-600 mt-1">
                    {formatPrice(item.price)} each
                  </p>
                </div>

                {/* Quantity Controls & Total */}
                <div className="flex flex-col items-end space-y-2">
                  {/* Item Total */}
                  <p className="font-medium text-lg">
                    {formatPrice(item.price * item.quantity)}
                  </p>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      className="h-8 w-8 p-0"
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                      className="h-8 w-8 p-0"
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFromCart(item.id)}
                    className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Selected Items Summary */}
          <div className="border-t pt-4 mt-6">
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  Selected Items ({selectedItemsCount}):
                </span>
                <span className="font-medium">
                  {formatPrice(selectedTotal)}
                </span>
              </div>
              
              {selectedItemsCount !== state.items.length && (
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>Remaining in cart ({state.items.length - selectedItemsCount}):</span>
                  <span>{formatPrice(state.total - selectedTotal)}</span>
                </div>
              )}
              
              <div className="flex justify-between items-center text-lg font-semibold pt-2 border-t">
                <span>Order Total:</span>
                <span className="text-blue-600">{formatPrice(selectedTotal)}</span>
              </div>
            </div>

            {selectedItemsCount === 0 && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  Please select at least one item to proceed with checkout.
                </p>
              </div>
            )}

            {selectedItemsCount > 0 && selectedItemsCount < state.items.length && (
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Unselected items will remain in your cart for future purchase.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}