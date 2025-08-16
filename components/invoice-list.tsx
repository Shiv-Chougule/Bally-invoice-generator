"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Invoice, Supplier } from "@/lib/types"
import { storage } from "@/lib/storage"
import { Search, Plus, Edit, Trash2, FileText, Calendar, Euro, Scan } from "lucide-react"

interface InvoiceListProps {
  onAddInvoice: () => void
  onEditInvoice: (invoice: Invoice) => void
  onScanInvoice?: () => void
}

export function InvoiceList({ onAddInvoice, onEditInvoice, onScanInvoice }: InvoiceListProps) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    let filtered = invoices

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter((invoice) => {
        const supplier = suppliers.find((s) => s.id === invoice.supplierId)
        return (
          invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          supplier?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((invoice) => invoice.status === statusFilter)
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    setFilteredInvoices(filtered)
  }, [invoices, suppliers, searchTerm, statusFilter])

  const loadData = () => {
    const loadedInvoices = storage.invoices.getAll()
    const loadedSuppliers = storage.suppliers.getAll()
    setInvoices(loadedInvoices)
    setSuppliers(loadedSuppliers)
  }

  const handleDeleteInvoice = (id: string) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      storage.invoices.delete(id)
      loadData()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-blue-100 text-blue-800"
      case "paid":
        return "bg-green-100 text-green-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isOverdue = (invoice: Invoice) => {
    return invoice.status !== "paid" && new Date(invoice.dueDate) < new Date()
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers found</h3>
        <p className="text-gray-600 mb-6">You need to add suppliers before creating invoices</p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices yet</h3>
        <p className="text-gray-600 mb-6">Get started by adding your first invoice or scanning one</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={onAddInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
          {onScanInvoice && (
            <Button variant="outline" onClick={onScanInvoice}>
              <Scan className="h-4 w-4 mr-2" />
              Scan Invoice
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search invoices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="overdue">Overdue</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2">
          <Button onClick={onAddInvoice}>
            <Plus className="h-4 w-4 mr-2" />
            Add Invoice
          </Button>
          {onScanInvoice && (
            <Button variant="outline" onClick={onScanInvoice}>
              <Scan className="h-4 w-4 mr-2" />
              Scan Invoice
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredInvoices.map((invoice) => {
          const supplier = suppliers.find((s) => s.id === invoice.supplierId)
          const overdue = isOverdue(invoice)

          return (
            <Card key={invoice.id} className={`hover:shadow-md transition-shadow ${overdue ? "border-red-200" : ""}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{invoice.invoiceNumber}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{supplier?.name || "Unknown Supplier"}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => onEditInvoice(invoice)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className={getStatusColor(overdue && invoice.status !== "paid" ? "overdue" : invoice.status)}>
                    {overdue && invoice.status !== "paid"
                      ? "Overdue"
                      : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-4 w-4 mr-2" />
                    {new Date(invoice.date).toLocaleDateString()}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Due: {new Date(invoice.dueDate).toLocaleDateString()}</div>
                  </div>
                </div>

                {invoice.description && <p className="text-sm text-gray-600 line-clamp-2">{invoice.description}</p>}

                <div className="pt-2 border-t">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      <div>Subtotal: €{invoice.subtotal.toFixed(2)}</div>
                      <div>
                        VAT ({invoice.vatRate}%): €{invoice.vatAmount.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-lg font-bold">
                        <Euro className="h-4 w-4 mr-1" />
                        {invoice.total.toFixed(2)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredInvoices.length === 0 && (searchTerm || statusFilter !== "all") && (
        <div className="text-center py-8">
          <p className="text-gray-600">No invoices found matching your filters</p>
        </div>
      )}
    </div>
  )
}
