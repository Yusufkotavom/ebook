"use client"

import { Button } from "@/components/ui/button"
import { SectionLoading } from "@/components/page-loading"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Eye, EyeOff, CreditCard, Wallet } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface PaymentMethod {
  id: string
  type: string
  name: string
  account_number: string | null
  account_name: string | null
  instructions: string | null
  is_active: boolean
  display_order: number
  created_at: string
}

interface PaymentMethodsTableProps {
  paymentMethods: PaymentMethod[]
}

export function PaymentMethodsTable({ paymentMethods }: PaymentMethodsTableProps) {
  const [deleteMethodId, setDeleteMethodId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isToggling, setIsToggling] = useState<string | null>(null)
  const router = useRouter()

  const handleDeleteMethod = async (methodId: string) => {
    setIsDeleting(true)

    try {
      const response = await fetch(`/api/payment-methods/${methodId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to delete payment method")
      }

      router.refresh()
      setDeleteMethodId(null)
    } catch (error) {
      console.error("Error deleting payment method:", error)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleToggleStatus = async (methodId: string, currentStatus: boolean) => {
    setIsToggling(methodId)

    try {
      const response = await fetch(`/api/payment-methods/${methodId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: !currentStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update payment method status")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating payment method status:", error)
    } finally {
      setIsToggling(null)
    }
  }

  const formatAccountNumber = (accountNumber: string | null, type: string) => {
    if (!accountNumber) return "-"
    if (type === "bank") {
      // Format bank account: 1234567890 -> 1234-567-890
      return accountNumber.replace(/(\d{4})(\d{3})(\d{3})/, "$1-$2-$3")
    } else {
      // Format phone number: 081234567890 -> 0812-3456-7890
      return accountNumber.replace(/(\d{4})(\d{4})(\d{4})/, "$1-$2-$3")
    }
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Type</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Account Number</TableHead>
            <TableHead>Account Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Order</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {paymentMethods.map((method) => (
            <TableRow key={method.id}>
              <TableCell>
                <div className="flex items-center gap-2">
                  {method.type === "bank" ? (
                    <CreditCard className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Wallet className="h-4 w-4 text-green-600" />
                  )}
                  <Badge variant={method.type === "bank" ? "default" : "secondary"}>
                    {method.type === "bank" ? "Bank" : "E-Wallet"}
                  </Badge>
                </div>
              </TableCell>
              <TableCell className="font-medium">{method.name}</TableCell>
              <TableCell className="font-mono text-sm">
                {formatAccountNumber(method.account_number, method.type)}
              </TableCell>
              <TableCell>{method.account_name || "-"}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Badge variant={method.is_active ? "default" : "secondary"}>
                    {method.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(method.id, method.is_active)}
                    disabled={isToggling === method.id}
                  >
                    {method.is_active ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell>{method.display_order}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Link href={`/admin/settings/payment-methods/edit/${method.id}`}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setDeleteMethodId(method.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {paymentMethods.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                No payment methods configured. Add your first payment method to get started.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <Dialog open={!!deleteMethodId} onOpenChange={() => setDeleteMethodId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Payment Method</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this payment method? This action cannot be undone and customers will no longer see this payment option.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteMethodId(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteMethodId && handleDeleteMethod(deleteMethodId)}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}