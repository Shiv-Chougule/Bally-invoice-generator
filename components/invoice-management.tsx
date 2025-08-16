"use client"

import { useState } from "react"
import { InvoiceList } from "./invoice-list"
import { InvoiceForm } from "./invoice-form"
import { OCRScanner } from "./ocr-scanner"
import type { Invoice } from "@/lib/types"

export function InvoiceManagement() {
  const [view, setView] = useState<"list" | "add" | "edit" | "scan">("list")
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const handleAddInvoice = () => {
    setSelectedInvoice(null)
    setView("add")
  }

  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setView("edit")
  }

  const handleScanInvoice = () => {
    setView("scan")
  }

  const handleSaveInvoice = (invoice: Invoice) => {
    setView("list")
    setSelectedInvoice(null)
  }

  const handleCancel = () => {
    setView("list")
    setSelectedInvoice(null)
  }

  const handleOCRComplete = (ocrResult: any) => {
    // Switch to add form with OCR data pre-filled
    setView("add")
    // The OCR data will be handled by the InvoiceForm component
  }

  if (view === "add" || view === "edit") {
    return <InvoiceForm invoice={selectedInvoice} onSave={handleSaveInvoice} onCancel={handleCancel} />
  }

  if (view === "scan") {
    return <OCRScanner onScanComplete={handleOCRComplete} onClose={() => setView("list")} />
  }

  return (
    <InvoiceList onAddInvoice={handleAddInvoice} onEditInvoice={handleEditInvoice} onScanInvoice={handleScanInvoice} />
  )
}
