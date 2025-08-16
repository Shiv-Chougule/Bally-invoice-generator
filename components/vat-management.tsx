"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import type { Invoice, Supplier } from "@/lib/types"
import { storage } from "@/lib/storage"
import { vatUtils, type VATSummary, type VATReport } from "@/lib/vat-utils"
import { Calculator, Download, FileText, TrendingUp, Calendar, Euro } from "lucide-react"

export function VATManagement() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("current-month")
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
  const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1)
  const [vatSummary, setVatSummary] = useState<VATSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    calculateVAT()
  }, [invoices, selectedPeriod, selectedYear, selectedMonth, selectedQuarter])

  const loadData = () => {
    const loadedInvoices = storage.invoices.getAll()
    const loadedSuppliers = storage.suppliers.getAll()
    setInvoices(loadedInvoices)
    setSuppliers(loadedSuppliers)
  }

  const calculateVAT = () => {
    if (invoices.length === 0) return

    setIsLoading(true)
    let summary: VATSummary

    switch (selectedPeriod) {
      case "current-month":
        summary = vatUtils.getMonthlyVAT(invoices, new Date().getFullYear(), new Date().getMonth())
        break
      case "custom-month":
        summary = vatUtils.getMonthlyVAT(invoices, selectedYear, selectedMonth)
        break
      case "custom-quarter":
        summary = vatUtils.getQuarterlyVAT(invoices, selectedYear, selectedQuarter)
        break
      case "custom-year":
        summary = vatUtils.getYearlyVAT(invoices, selectedYear)
        break
      default:
        summary = vatUtils.getMonthlyVAT(invoices, new Date().getFullYear(), new Date().getMonth())
    }

    setVatSummary(summary)
    setIsLoading(false)
  }

  const handleExportReport = () => {
    if (!vatSummary) return

    const filteredInvoices = getFilteredInvoices()
    const report: VATReport = {
      summary: vatSummary,
      invoices: filteredInvoices,
      generatedAt: new Date(),
    }

    const filename = `vat-report-${selectedPeriod}-${new Date().toISOString().split("T")[0]}.txt`
    vatUtils.downloadVATReport(report, filename)
  }

  const getFilteredInvoices = (): Invoice[] => {
    let startDate: Date
    let endDate: Date

    switch (selectedPeriod) {
      case "current-month":
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
        break
      case "custom-month":
        startDate = new Date(selectedYear, selectedMonth, 1)
        endDate = new Date(selectedYear, selectedMonth + 1, 0)
        break
      case "custom-quarter":
        const startMonth = (selectedQuarter - 1) * 3
        startDate = new Date(selectedYear, startMonth, 1)
        endDate = new Date(selectedYear, startMonth + 3, 0)
        break
      case "custom-year":
        startDate = new Date(selectedYear, 0, 1)
        endDate = new Date(selectedYear, 11, 31)
        break
      default:
        startDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
        endDate = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0)
    }

    return invoices.filter((invoice) => {
      const invoiceDate = new Date(invoice.date)
      return invoiceDate >= startDate && invoiceDate <= endDate
    })
  }

  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find((s) => s.id === supplierId)
    return supplier?.name || "Unknown Supplier"
  }

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices for VAT calculation</h3>
        <p className="text-gray-600">Add some invoices to generate VAT reports</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Period Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            VAT Report Period
          </CardTitle>
          <CardDescription>Select the period for VAT calculations and reporting</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Period Type</label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="current-month">Current Month</SelectItem>
                  <SelectItem value="custom-month">Custom Month</SelectItem>
                  <SelectItem value="custom-quarter">Custom Quarter</SelectItem>
                  <SelectItem value="custom-year">Custom Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(selectedPeriod === "custom-month" ||
              selectedPeriod === "custom-quarter" ||
              selectedPeriod === "custom-year") && (
              <div>
                <label className="text-sm font-medium mb-2 block">Year</label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedPeriod === "custom-month" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Month</label>
                <Select
                  value={selectedMonth.toString()}
                  onValueChange={(value) => setSelectedMonth(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month, index) => (
                      <SelectItem key={index} value={index.toString()}>
                        {month}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {selectedPeriod === "custom-quarter" && (
              <div>
                <label className="text-sm font-medium mb-2 block">Quarter</label>
                <Select
                  value={selectedQuarter.toString()}
                  onValueChange={(value) => setSelectedQuarter(Number.parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Q1 (Jan-Mar)</SelectItem>
                    <SelectItem value="2">Q2 (Apr-Jun)</SelectItem>
                    <SelectItem value="3">Q3 (Jul-Sep)</SelectItem>
                    <SelectItem value="4">Q4 (Oct-Dec)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* VAT Summary */}
      {vatSummary && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total VAT</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{vatSummary.totalVAT.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">{vatSummary.period}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vatSummary.invoiceCount}</div>
                <p className="text-xs text-muted-foreground">Processed invoices</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Net Amount</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{vatSummary.totalSubtotal.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Excluding VAT</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Gross Amount</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">€{vatSummary.totalAmount.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">Including VAT</p>
              </CardContent>
            </Card>
          </div>

          {/* VAT Breakdown by Rate */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>VAT Breakdown by Rate</CardTitle>
                  <CardDescription>Detailed breakdown of VAT amounts by tax rate</CardDescription>
                </div>
                <Button onClick={handleExportReport} variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(vatSummary.vatByRate).map(([rate, data]) => (
                  <div key={rate} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge variant="secondary" className="text-lg px-3 py-1">
                        {rate}%
                      </Badge>
                      <div>
                        <p className="font-medium">{data.count} invoices</p>
                        <p className="text-sm text-gray-600">Net: €{data.subtotal.toFixed(2)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold">€{data.vat.toFixed(2)}</p>
                      <p className="text-sm text-gray-600">VAT Amount</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Invoices in Period */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices in Selected Period</CardTitle>
              <CardDescription>All invoices included in this VAT calculation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {getFilteredInvoices()
                  .slice(0, 10)
                  .map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                          <Badge variant="outline">{getSupplierName(invoice.supplierId)}</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{new Date(invoice.date).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">€{invoice.total.toFixed(2)}</p>
                        <p className="text-sm text-gray-600">
                          VAT: €{invoice.vatAmount.toFixed(2)} ({invoice.vatRate}%)
                        </p>
                      </div>
                    </div>
                  ))}
                {getFilteredInvoices().length > 10 && (
                  <p className="text-sm text-gray-600 text-center pt-2">
                    ... and {getFilteredInvoices().length - 10} more invoices
                  </p>
                )}
                {getFilteredInvoices().length === 0 && (
                  <p className="text-gray-600 text-center py-4">No invoices found for the selected period</p>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Calculating VAT...</p>
        </div>
      )}
    </div>
  )
}
