"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Supplier } from "@/lib/types"
import { storage } from "@/lib/storage"

interface SupplierFormProps {
  supplier?: Supplier
  onSave: (supplier: Supplier) => void
  onCancel: () => void
}

export function SupplierForm({ supplier, onSave, onCancel }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: supplier?.name || "",
    address: supplier?.address || "",
    vatNumber: supplier?.vatNumber || "",
    contactPerson: supplier?.contactPerson || "",
    email: supplier?.email || "",
    phone: supplier?.phone || "",
    paymentTerms: supplier?.paymentTerms || 30,
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let savedSupplier: Supplier

      if (supplier) {
        // Update existing supplier
        savedSupplier = storage.suppliers.update(supplier.id, formData)!
      } else {
        // Create new supplier
        savedSupplier = storage.suppliers.add(formData)
      }

      onSave(savedSupplier)
    } catch (error) {
      console.error("Error saving supplier:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>{supplier ? "Edit Supplier" : "Add New Supplier"}</CardTitle>
        <CardDescription>
          {supplier ? "Update supplier information" : "Enter supplier details to add them to your database"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Company Name *</Label>
              <Input id="name" value={formData.name} onChange={(e) => handleChange("name", e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="vatNumber">VAT Number</Label>
              <Input
                id="vatNumber"
                value={formData.vatNumber}
                onChange={(e) => handleChange("vatNumber", e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Input id="address" value={formData.address} onChange={(e) => handleChange("address", e.target.value)} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contactPerson">Contact Person</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => handleChange("contactPerson", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" value={formData.phone} onChange={(e) => handleChange("phone", e.target.value)} />
            </div>
            <div>
              <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={formData.paymentTerms}
                onChange={(e) => handleChange("paymentTerms", Number.parseInt(e.target.value) || 30)}
                min="1"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : supplier ? "Update Supplier" : "Add Supplier"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
