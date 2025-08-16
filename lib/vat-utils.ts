import type { Invoice } from "./types"

export interface VATSummary {
  period: string
  totalVAT: number
  totalSubtotal: number
  totalAmount: number
  invoiceCount: number
  vatByRate: { [rate: number]: { vat: number; subtotal: number; count: number } }
  suppliers: string[]
}

export interface VATReport {
  summary: VATSummary
  invoices: Invoice[]
  generatedAt: Date
}

export const vatUtils = {
  calculateVATForPeriod: (invoices: Invoice[], startDate: Date, endDate: Date): VATSummary => {
    const filteredInvoices = invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date)
      return invoiceDate >= startDate && invoiceDate <= endDate
    })

    const vatByRate: { [rate: number]: { vat: number; subtotal: number; count: number } } = {}
    let totalVAT = 0
    let totalSubtotal = 0
    let totalAmount = 0
    const supplierIds = new Set<string>()

    filteredInvoices.forEach((invoice) => {
      totalVAT += invoice.vatAmount
      totalSubtotal += invoice.subtotal
      totalAmount += invoice.total
      supplierIds.add(invoice.supplierId)

      if (!vatByRate[invoice.vatRate]) {
        vatByRate[invoice.vatRate] = { vat: 0, subtotal: 0, count: 0 }
      }
      vatByRate[invoice.vatRate].vat += invoice.vatAmount
      vatByRate[invoice.vatRate].subtotal += invoice.subtotal
      vatByRate[invoice.vatRate].count += 1
    })

    return {
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      totalVAT,
      totalSubtotal,
      totalAmount,
      invoiceCount: filteredInvoices.length,
      vatByRate,
      suppliers: Array.from(supplierIds),
    }
  },

  getMonthlyVAT: (invoices: Invoice[], year: number, month: number): VATSummary => {
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    return vatUtils.calculateVATForPeriod(invoices, startDate, endDate)
  },

  getQuarterlyVAT: (invoices: Invoice[], year: number, quarter: number): VATSummary => {
    const startMonth = (quarter - 1) * 3
    const startDate = new Date(year, startMonth, 1)
    const endDate = new Date(year, startMonth + 3, 0)
    return vatUtils.calculateVATForPeriod(invoices, startDate, endDate)
  },

  getYearlyVAT: (invoices: Invoice[], year: number): VATSummary => {
    const startDate = new Date(year, 0, 1)
    const endDate = new Date(year, 11, 31)
    return vatUtils.calculateVATForPeriod(invoices, startDate, endDate)
  },

  exportVATReport: (report: VATReport): string => {
    const lines = [
      "VAT Report",
      `Generated: ${report.generatedAt.toLocaleString()}`,
      `Period: ${report.summary.period}`,
      "",
      "Summary:",
      `Total Invoices: ${report.summary.invoiceCount}`,
      `Total Subtotal: €${report.summary.totalSubtotal.toFixed(2)}`,
      `Total VAT: €${report.summary.totalVAT.toFixed(2)}`,
      `Total Amount: €${report.summary.totalAmount.toFixed(2)}`,
      "",
      "VAT by Rate:",
    ]

    Object.entries(report.summary.vatByRate).forEach(([rate, data]) => {
      lines.push(`${rate}%: €${data.vat.toFixed(2)} (${data.count} invoices, €${data.subtotal.toFixed(2)} subtotal)`)
    })

    lines.push("", "Invoice Details:")
    lines.push("Invoice Number,Date,Supplier,Subtotal,VAT Rate,VAT Amount,Total")

    report.invoices.forEach((invoice) => {
      lines.push(
        `${invoice.invoiceNumber},${new Date(invoice.date).toLocaleDateString()},${invoice.supplierId},${invoice.subtotal.toFixed(2)},${invoice.vatRate}%,${invoice.vatAmount.toFixed(2)},${invoice.total.toFixed(2)}`,
      )
    })

    return lines.join("\n")
  },

  downloadVATReport: (report: VATReport, filename: string) => {
    const content = vatUtils.exportVATReport(report)
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
