import type { Invoice, Supplier } from "./types"

export interface SupplierReport {
  supplier: Supplier
  totalInvoices: number
  totalAmount: number
  totalVAT: number
  averageInvoiceValue: number
  lastInvoiceDate: Date | null
  paymentTermsCompliance: number
}

export interface PaymentReport {
  totalPaid: number
  totalPending: number
  totalOverdue: number
  overdueAmount: number
  averagePaymentTime: number
  paymentTrends: { month: string; paid: number; pending: number }[]
}

export interface FinancialSummary {
  totalRevenue: number
  totalVAT: number
  monthlyTrends: { month: string; revenue: number; vat: number; invoices: number }[]
  topSuppliers: { supplier: Supplier; amount: number }[]
  vatByRate: { rate: number; amount: number; percentage: number }[]
}

export const reportsUtils = {
  generateSupplierReports: (suppliers: Supplier[], invoices: Invoice[]): SupplierReport[] => {
    return suppliers.map((supplier) => {
      const supplierInvoices = invoices.filter((inv) => inv.supplierId === supplier.id)
      const totalAmount = supplierInvoices.reduce((sum, inv) => sum + inv.total, 0)
      const totalVAT = supplierInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0)
      const lastInvoice = supplierInvoices.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      // Calculate payment terms compliance
      const paidInvoices = supplierInvoices.filter((inv) => inv.status === "paid")
      const onTimePayments = paidInvoices.filter((inv) => {
        const daysDiff = Math.floor((new Date().getTime() - new Date(inv.dueDate).getTime()) / (1000 * 60 * 60 * 24))
        return daysDiff <= 0
      })
      const compliance = paidInvoices.length > 0 ? (onTimePayments.length / paidInvoices.length) * 100 : 0

      return {
        supplier,
        totalInvoices: supplierInvoices.length,
        totalAmount,
        totalVAT,
        averageInvoiceValue: supplierInvoices.length > 0 ? totalAmount / supplierInvoices.length : 0,
        lastInvoiceDate: lastInvoice ? new Date(lastInvoice.date) : null,
        paymentTermsCompliance: compliance,
      }
    })
  },

  generatePaymentReport: (invoices: Invoice[]): PaymentReport => {
    const paidInvoices = invoices.filter((inv) => inv.status === "paid")
    const pendingInvoices = invoices.filter((inv) => inv.status === "pending" || inv.status === "approved")
    const overdueInvoices = invoices.filter((inv) => inv.status !== "paid" && new Date(inv.dueDate) < new Date())

    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.total, 0)
    const overdueAmount = overdueInvoices.reduce((sum, inv) => sum + inv.total, 0)

    // Calculate average payment time (simplified)
    const averagePaymentTime = 15 // Placeholder - would calculate actual payment times

    // Generate monthly payment trends
    const monthlyTrends = []
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en", { month: "short", year: "2-digit" })

      const monthInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.date)
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear()
      })

      const paid = monthInvoices.filter((inv) => inv.status === "paid").reduce((sum, inv) => sum + inv.total, 0)
      const pending = monthInvoices.filter((inv) => inv.status !== "paid").reduce((sum, inv) => sum + inv.total, 0)

      monthlyTrends.push({ month: monthName, paid, pending })
    }

    return {
      totalPaid,
      totalPending,
      totalOverdue: overdueInvoices.length,
      overdueAmount,
      averagePaymentTime,
      paymentTrends: monthlyTrends,
    }
  },

  generateFinancialSummary: (invoices: Invoice[], suppliers: Supplier[]): FinancialSummary => {
    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0)
    const totalVAT = invoices.reduce((sum, inv) => sum + inv.vatAmount, 0)

    // Monthly trends
    const monthlyTrends = []
    for (let i = 11; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthName = date.toLocaleDateString("en", { month: "short" })

      const monthInvoices = invoices.filter((inv) => {
        const invDate = new Date(inv.date)
        return invDate.getMonth() === date.getMonth() && invDate.getFullYear() === date.getFullYear()
      })

      const revenue = monthInvoices.reduce((sum, inv) => sum + inv.total, 0)
      const vat = monthInvoices.reduce((sum, inv) => sum + inv.vatAmount, 0)

      monthlyTrends.push({
        month: monthName,
        revenue,
        vat,
        invoices: monthInvoices.length,
      })
    }

    // Top suppliers by amount
    const supplierTotals = suppliers.map((supplier) => {
      const supplierInvoices = invoices.filter((inv) => inv.supplierId === supplier.id)
      const amount = supplierInvoices.reduce((sum, inv) => sum + inv.total, 0)
      return { supplier, amount }
    })
    const topSuppliers = supplierTotals.sort((a, b) => b.amount - a.amount).slice(0, 5)

    // VAT by rate
    const vatRates: { [rate: number]: number } = {}
    invoices.forEach((inv) => {
      vatRates[inv.vatRate] = (vatRates[inv.vatRate] || 0) + inv.vatAmount
    })

    const vatByRate = Object.entries(vatRates).map(([rate, amount]) => ({
      rate: Number.parseFloat(rate),
      amount,
      percentage: totalVAT > 0 ? (amount / totalVAT) * 100 : 0,
    }))

    return {
      totalRevenue,
      totalVAT,
      monthlyTrends,
      topSuppliers,
      vatByRate,
    }
  },

  exportReport: (reportType: string, data: any): string => {
    const timestamp = new Date().toLocaleString()
    let content = `${reportType} Report\nGenerated: ${timestamp}\n\n`

    switch (reportType) {
      case "Supplier Performance":
        content += "Supplier,Total Invoices,Total Amount,Average Invoice,Last Invoice,Payment Compliance\n"
        data.forEach((report: SupplierReport) => {
          content += `${report.supplier.name},${report.totalInvoices},€${report.totalAmount.toFixed(2)},€${report.averageInvoiceValue.toFixed(2)},${report.lastInvoiceDate?.toLocaleDateString() || "N/A"},${report.paymentTermsCompliance.toFixed(1)}%\n`
        })
        break

      case "Payment Analysis":
        content += `Total Paid: €${data.totalPaid.toFixed(2)}\n`
        content += `Total Pending: €${data.totalPending.toFixed(2)}\n`
        content += `Overdue Invoices: ${data.totalOverdue}\n`
        content += `Overdue Amount: €${data.overdueAmount.toFixed(2)}\n\n`
        content += "Monthly Trends:\nMonth,Paid,Pending\n"
        data.paymentTrends.forEach((trend: any) => {
          content += `${trend.month},€${trend.paid.toFixed(2)},€${trend.pending.toFixed(2)}\n`
        })
        break

      case "Financial Summary":
        content += `Total Revenue: €${data.totalRevenue.toFixed(2)}\n`
        content += `Total VAT: €${data.totalVAT.toFixed(2)}\n\n`
        content += "Top Suppliers:\n"
        data.topSuppliers.forEach((supplier: any) => {
          content += `${supplier.supplier.name}: €${supplier.amount.toFixed(2)}\n`
        })
        break
    }

    return content
  },

  downloadReport: (reportType: string, data: any) => {
    const content = reportsUtils.exportReport(reportType, data)
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${reportType.toLowerCase().replace(" ", "-")}-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  },
}
