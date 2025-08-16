"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Supplier } from "@/lib/types"
import { storage } from "@/lib/storage"
import { Search, Plus, Edit, Trash2, Building2, Mail, Phone } from "lucide-react"

interface SupplierListProps {
  onAddSupplier: () => void
  onEditSupplier: (supplier: Supplier) => void
}

export function SupplierList({ onAddSupplier, onEditSupplier }: SupplierListProps) {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredSuppliers, setFilteredSuppliers] = useState<Supplier[]>([])

  useEffect(() => {
    loadSuppliers()
  }, [])

  useEffect(() => {
    const filtered = suppliers.filter(
      (supplier) =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.vatNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    setFilteredSuppliers(filtered)
  }, [suppliers, searchTerm])

  const loadSuppliers = () => {
    const loadedSuppliers = storage.suppliers.getAll()
    setSuppliers(loadedSuppliers)
  }

  const handleDeleteSupplier = (id: string) => {
    if (confirm("Are you sure you want to delete this supplier?")) {
      storage.suppliers.delete(id)
      loadSuppliers()
    }
  }

  if (suppliers.length === 0) {
    return (
      <div className="text-center py-12">
        <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No suppliers yet</h3>
        <p className="text-gray-600 mb-6">Get started by adding your first supplier</p>
        <Button onClick={onAddSupplier}>
          <Plus className="h-4 w-4 mr-2" />
          Add First Supplier
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={onAddSupplier}>
          <Plus className="h-4 w-4 mr-2" />
          Add Supplier
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{supplier.name}</CardTitle>
                  {supplier.vatNumber && (
                    <Badge variant="secondary" className="mt-1">
                      VAT: {supplier.vatNumber}
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="sm" onClick={() => onEditSupplier(supplier)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteSupplier(supplier.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {supplier.address && (
                <div className="text-sm text-gray-600">
                  <Building2 className="h-4 w-4 inline mr-2" />
                  {supplier.address}
                </div>
              )}

              {supplier.contactPerson && (
                <div className="text-sm">
                  <span className="font-medium">Contact: </span>
                  {supplier.contactPerson}
                </div>
              )}

              <div className="flex flex-col space-y-1">
                {supplier.email && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Mail className="h-4 w-4 mr-2" />
                    {supplier.email}
                  </div>
                )}
                {supplier.phone && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="h-4 w-4 mr-2" />
                    {supplier.phone}
                  </div>
                )}
              </div>

              <div className="pt-2 border-t">
                <div className="text-sm text-gray-600">
                  Payment Terms: <span className="font-medium">{supplier.paymentTerms} days</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && searchTerm && (
        <div className="text-center py-8">
          <p className="text-gray-600">No suppliers found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  )
}
