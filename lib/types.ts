export interface Supplier {
  id: string
  name: string
  address: string
  vatNumber: string
  contactPerson: string
  email: string
  phone: string
  paymentTerms: number // days
  createdAt: Date
  updatedAt: Date
}

export interface Invoice {
  id: string
  supplierId: string
  invoiceNumber: string
  date: Date
  dueDate: Date
  subtotal: number
  vatRate: number
  vatAmount: number
  total: number
  status: "pending" | "approved" | "paid" | "overdue"
  description: string
  attachments: string[]
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  email: string
  name: string
  role: "admin" | "user"
}

export interface VATReport {
  period: string
  totalVAT: number
  invoiceCount: number
  suppliers: string[]
}
