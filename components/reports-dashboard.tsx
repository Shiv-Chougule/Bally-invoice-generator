"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import type { Invoice, Supplier } from "@/lib/types"
import { storage } from "@/lib/storage"
import { reportsUtils, type SupplierReport, type PaymentReport, type FinancialSummary } from "@/lib/reports-utils"
import { BarChart3, Download, TrendingUp, Users, Euro, Calendar, AlertTriangle, CheckCircle } from "lucide-react"

export function ReportsDashboard() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [supplierReports, setSupplierReports] = useState<SupplierReport[]>([])
  const [paymentReport, setPaymentReport] = useState<PaymentReport | null>(null)
  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    setIsLoading(true)
    const loadedInvoices = storage.invoices.getAll()
    const loadedSuppliers = storage.suppliers.getAll()

    setInvoices(loadedInvoices)
    setSuppliers(loadedSuppliers)

    // Generate reports
    const supplierReports = reportsUtils.generateSupplierReports(loadedSuppliers, loadedInvoices)
    const paymentReport = reportsUtils.generatePaymentReport(loadedInvoices)
    const financialSummary = reportsUtils.generateFinancialSummary(loadedInvoices, loadedSuppliers)

    setSupplierReports(supplierReports)
    setPaymentReport(paymentReport)
    setFinancialSummary(financialSummary)
    setIsLoading(false)
  }

  const handleExportReport = (reportType: string, data: any) => {
    reportsUtils.downloadReport(reportType, data)
  }

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-gray-600">Generating reports...</p>
      </div>
    )
  }

  if (invoices.length === 0) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No data for reports</h3>
        <p className="text-gray-600">Add suppliers and invoices to generate comprehensive reports</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Euro className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{financialSummary?.totalRevenue.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Suppliers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{suppliers.length}</div>
            <p className="text-xs text-muted-foreground">
              {supplierReports.filter((s) => s.totalInvoices > 0).length} with invoices
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid Invoices</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{paymentReport?.totalPaid.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Amount</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">€{paymentReport?.overdueAmount.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">{paymentReport?.totalOverdue || 0} invoices</p>
          </CardContent>
        </Card>
      </div>

      {/* Financial Summary */}
      {financialSummary && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Financial Summary
                </CardTitle>
                <CardDescription>Revenue and VAT trends over the last 12 months</CardDescription>
              </div>
              <Button variant="outline" onClick={() => handleExportReport("Financial Summary", financialSummary)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Monthly Trends Chart (Simplified) */}
              <div>
                <h4 className="font-medium mb-4">Monthly Revenue Trends</h4>
                <div className="space-y-3">
                  {financialSummary.monthlyTrends.slice(-6).map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-sm font-medium w-12">{trend.month}</span>
                        <div className="flex-1">
                          <Progress
                            value={
                              financialSummary.totalRevenue > 0
                                ? (trend.revenue / Math.max(...financialSummary.monthlyTrends.map((t) => t.revenue))) *
                                  100
                                : 0
                            }
                            className="w-32"
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">€{trend.revenue.toFixed(0)}</p>
                        <p className="text-xs text-gray-600">{trend.invoices} invoices</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Suppliers */}
              <div>
                <h4 className="font-medium mb-4">Top Suppliers by Revenue</h4>
                <div className="space-y-3">
                  {financialSummary.topSuppliers.slice(0, 5).map((supplier, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        <Badge variant="secondary">#{index + 1}</Badge>
                        <span className="font-medium">{supplier.supplier.name}</span>
                      </div>
                      <span className="font-bold">€{supplier.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* VAT Breakdown */}
              <div>
                <h4 className="font-medium mb-4">VAT by Rate</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {financialSummary.vatByRate.map((vat, index) => (
                    <div key={index} className="text-center p-4 border rounded">
                      <div className="text-2xl font-bold">{vat.rate}%</div>
                      <div className="text-sm text-gray-600">€{vat.amount.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{vat.percentage.toFixed(1)}% of total VAT</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Analysis */}
      {paymentReport && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Payment Analysis
                </CardTitle>
                <CardDescription>Payment status and trends analysis</CardDescription>
              </div>
              <Button variant="outline" onClick={() => handleExportReport("Payment Analysis", paymentReport)}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Payment Status Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-green-50 border border-green-200 rounded">
                  <div className="text-2xl font-bold text-green-600">€{paymentReport.totalPaid.toFixed(2)}</div>
                  <div className="text-sm text-green-700">Paid</div>
                </div>
                <div className="text-center p-4 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="text-2xl font-bold text-yellow-600">€{paymentReport.totalPending.toFixed(2)}</div>
                  <div className="text-sm text-yellow-700">Pending</div>
                </div>
                <div className="text-center p-4 bg-red-50 border border-red-200 rounded">
                  <div className="text-2xl font-bold text-red-600">€{paymentReport.overdueAmount.toFixed(2)}</div>
                  <div className="text-sm text-red-700">Overdue</div>
                </div>
              </div>

              {/* Payment Trends */}
              <div>
                <h4 className="font-medium mb-4">Payment Trends (Last 6 Months)</h4>
                <div className="space-y-3">
                  {paymentReport.paymentTrends.map((trend, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium w-16">{trend.month}</span>
                      <div className="flex-1 flex space-x-2">
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Paid</span>
                            <span>€{trend.paid.toFixed(0)}</span>
                          </div>
                          <Progress
                            value={
                              trend.paid + trend.pending > 0 ? (trend.paid / (trend.paid + trend.pending)) * 100 : 0
                            }
                            className="h-2"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Pending</span>
                            <span>€{trend.pending.toFixed(0)}</span>
                          </div>
                          <Progress
                            value={
                              trend.paid + trend.pending > 0 ? (trend.pending / (trend.paid + trend.pending)) * 100 : 0
                            }
                            className="h-2"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Supplier Performance */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Supplier Performance
              </CardTitle>
              <CardDescription>Detailed analysis of supplier relationships and performance</CardDescription>
            </div>
            <Button variant="outline" onClick={() => handleExportReport("Supplier Performance", supplierReports)}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {supplierReports
              .filter((report) => report.totalInvoices > 0)
              .sort((a, b) => b.totalAmount - a.totalAmount)
              .slice(0, 10)
              .map((report, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <h4 className="font-medium">{report.supplier.name}</h4>
                        <p className="text-sm text-gray-600">
                          {report.totalInvoices} invoices • Avg: €{report.averageInvoiceValue.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">€{report.totalAmount.toFixed(2)}</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-600">Payment compliance:</span>
                      <Badge
                        variant={report.paymentTermsCompliance >= 80 ? "default" : "destructive"}
                        className="text-xs"
                      >
                        {report.paymentTermsCompliance.toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            {supplierReports.filter((report) => report.totalInvoices > 0).length === 0 && (
              <p className="text-gray-600 text-center py-4">No supplier activity to report</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
