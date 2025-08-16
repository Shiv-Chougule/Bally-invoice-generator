"use client"

import { useState } from "react"
import { SupplierList } from "./supplier-list"
import { SupplierForm } from "./supplier-form"
import type { Supplier } from "@/lib/types"

export function SupplierManagement() {
  const [view, setView] = useState<"list" | "add" | "edit">("list")
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)

  const handleAddSupplier = () => {
    setSelectedSupplier(null)
    setView("add")
  }

  const handleEditSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setView("edit")
  }

  const handleSaveSupplier = (supplier: Supplier) => {
    setView("list")
    setSelectedSupplier(null)
  }

  const handleCancel = () => {
    setView("list")
    setSelectedSupplier(null)
  }

  if (view === "add" || view === "edit") {
    return <SupplierForm supplier={selectedSupplier} onSave={handleSaveSupplier} onCancel={handleCancel} />
  }

  return <SupplierList onAddSupplier={handleAddSupplier} onEditSupplier={handleEditSupplier} />
}
