"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { OCRScanner } from "./ocr-scanner"
import type { Invoice, Supplier } from "@/lib/types"
import { storage } from "@/lib/storage"
import { Scan } from "lucide-react"

interface InvoiceFormProps {
  invoice?: Invoice
  onSave: (invoice: Invoice) => void
  onCancel: () => void
}

export function InvoiceForm({ invoice, onSave, onCancel }: InvoiceFormProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [showOCR, setShowOCR] = useState(false)
  const [formData, setFormData] = useState({
    supplierId: invoice?.supplierId || "",
    invoiceNumber: invoice?.invoiceNumber || "",
    date: invoice?.date ? invoice.date.toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    dueDate: invoice?.dueDate ? invoice.dueDate.toISOString().split("T")[0] : "",
    subtotal: invoice?.subtotal || 0,
    vatRate: invoice?.vatRate || 21,
    status: invoice?.status || ("pending" as const),
    description: invoice?.description || "",
  })

  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setSuppliers(storage.suppliers.getAll())
  }, [])

  useEffect(() => {
    // Auto-calculate due date based on supplier payment terms
    if (formData.supplierId && formData.date) {
      const supplier = suppliers.find((s) => s.id === formData.supplierId)
      if (supplier) {
        const dueDate = new Date(formData.date)
        dueDate.setDate(dueDate.getDate() + supplier.paymentTerms)
        setFormData((prev) => ({
          ...prev,
          dueDate: dueDate.toISOString().split("T")[0],
        }))
      }
    }
  }, [formData.supplierId, formData.date, suppliers])

  const vatAmount = (formData.subtotal * formData.vatRate) / 100
  const total = formData.subtotal + vatAmount

  const handleOCRComplete = (ocrResult: any) => {
    // Find supplier by name if provided
    let supplierId = formData.supplierId
    if (ocrResult.supplierName) {
      const matchingSupplier = suppliers.find(
        (s) =>
          s.name.toLowerCase().includes(ocrResult.supplierName.toLowerCase()) ||
          ocrResult.supplierName.toLowerCase().includes(s.name.toLowerCase()),
      )
      if (matchingSupplier) {
        supplierId = matchingSupplier.id
      }
    }

    // Calculate subtotal from total and VAT if available
    let subtotal = ocrResult.subtotal || formData.subtotal
    if (ocrResult.total && ocrResult.vatAmount && !ocrResult.subtotal) {
      subtotal = ocrResult.total - ocrResult.vatAmount
    }

    setFormData((prev) => ({
      ...prev,
      supplierId,
      invoiceNumber: ocrResult.invoiceNumber || prev.invoiceNumber,
      date: ocrResult.date || prev.date,
      subtotal,
      description: ocrResult.description || prev.description,
    }))

    setShowOCR(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const invoiceData = {
        ...formData,
        date: new Date(formData.date),
        dueDate: new Date(formData.dueDate),
        vatAmount,
        total,
        attachments: invoice?.attachments || [],
      }

      let savedInvoice: Invoice

      if (invoice) {
        savedInvoice = storage.invoices.update(invoice.id, invoiceData)!
      } else {
        savedInvoice = storage.invoices.add(invoiceData)
      }

      onSave(savedInvoice)
    } catch (error) {
      console.error("Error saving invoice:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (showOCR) {
    return <OCRScanner onScanComplete={handleOCRComplete} onClose={() => setShowOCR(false)} />
  }

  return (
    <Card className="max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{invoice ? "Edit Invoice" : "Add New Invoice"}</CardTitle>
            <CardDescription>
              {invoice
                ? "Update invoice information"
                : "Enter invoice details and VAT will be calculated automatically"}
            </CardDescription>
          </div>
          {!invoice && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowOCR(true)}
              className="flex items-center gap-2"
            >
              <Scan className="h-4 w-4" />
              Scan Invoice
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplier">Supplier *</Label>
              <Select value={formData.supplierId} onValueChange={(value) => handleChange("supplierId", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="invoiceNumber">Invoice Number *</Label>
              <Input
                id="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={(e) => handleChange("invoiceNumber", e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="date">Invoice Date *</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date *</Label>
              <Input
                id="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleChange("dueDate", e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleChange("status", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="subtotal">Subtotal (€) *</Label>
              <Input
                id="subtotal"
                type="number"
                step="0.01"
                value={formData.subtotal}
                onChange={(e) => handleChange("subtotal", Number.parseFloat(e.target.value) || 0)}
                required
              />
            </div>
            <div>
              <Label htmlFor="vatRate">VAT Rate (%)</Label>
              <Select
                value={formData.vatRate.toString()}
                onValueChange={(value) => handleChange("vatRate", Number.parseFloat(value))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">0%</SelectItem>
                  <SelectItem value="6">6%</SelectItem>
                  <SelectItem value="12">12%</SelectItem>
                  <SelectItem value="21">21%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* VAT Calculation Summary */}
          <Card className="bg-gray-50">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>€{formData.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>VAT ({formData.vatRate}%):</span>
                  <span>€{vatAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total:</span>
                  <span>€{total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !formData.supplierId}>
              {isLoading ? "Saving..." : invoice ? "Update Invoice" : "Add Invoice"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
