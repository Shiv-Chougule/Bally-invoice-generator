// Local storage utilities for data persistence
import type { Supplier, Invoice } from "./types" // Assuming Supplier and Invoice are defined in a types file

export const storage = {
  suppliers: {
    getAll: (): Supplier[] => {
      if (typeof window === "undefined") return []
      const data = localStorage.getItem("bally_suppliers")
      return data ? JSON.parse(data) : []
    },
    save: (suppliers: Supplier[]) => {
      if (typeof window === "undefined") return
      localStorage.setItem("bally_suppliers", JSON.stringify(suppliers))
    },
    add: (supplier: Omit<Supplier, "id" | "createdAt" | "updatedAt">) => {
      const suppliers = storage.suppliers.getAll()
      const newSupplier: Supplier = {
        ...supplier,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      suppliers.push(newSupplier)
      storage.suppliers.save(suppliers)
      return newSupplier
    },
    update: (id: string, updates: Partial<Supplier>) => {
      const suppliers = storage.suppliers.getAll()
      const index = suppliers.findIndex((s) => s.id === id)
      if (index !== -1) {
        suppliers[index] = { ...suppliers[index], ...updates, updatedAt: new Date() }
        storage.suppliers.save(suppliers)
        return suppliers[index]
      }
      return null
    },
    delete: (id: string) => {
      const suppliers = storage.suppliers.getAll().filter((s) => s.id !== id)
      storage.suppliers.save(suppliers)
    },
  },
  invoices: {
    getAll: (): Invoice[] => {
      if (typeof window === "undefined") return []
      const data = localStorage.getItem("bally_invoices")
      return data
        ? JSON.parse(data).map((inv: any) => ({
            ...inv,
            date: new Date(inv.date),
            dueDate: new Date(inv.dueDate),
            createdAt: new Date(inv.createdAt),
            updatedAt: new Date(inv.updatedAt),
          }))
        : []
    },
    save: (invoices: Invoice[]) => {
      if (typeof window === "undefined") return
      localStorage.setItem("bally_invoices", JSON.stringify(invoices))
    },
    add: (invoice: Omit<Invoice, "id" | "createdAt" | "updatedAt">) => {
      const invoices = storage.invoices.getAll()
      const newInvoice: Invoice = {
        ...invoice,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      invoices.push(newInvoice)
      storage.invoices.save(invoices)
      return newInvoice
    },
    update: (id: string, updates: Partial<Invoice>) => {
      const invoices = storage.invoices.getAll()
      const index = invoices.findIndex((inv) => inv.id === id)
      if (index !== -1) {
        invoices[index] = { ...invoices[index], ...updates, updatedAt: new Date() }
        storage.invoices.save(invoices)
        return invoices[index]
      }
      return null
    },
    delete: (id: string) => {
      const invoices = storage.invoices.getAll().filter((inv) => inv.id !== id)
      storage.invoices.save(invoices)
    },
  },
}
