"use client"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SupplierManagement } from "@/components/supplier-management"
import { InvoiceManagement } from "@/components/invoice-management"
import { VATManagement } from "@/components/vat-management"
import { ReportsDashboard } from "@/components/reports-dashboard"
import { useState, useEffect } from "react"
import { storage } from "@/lib/storage"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, FileText, Calculator, BarChart3, Plus, Receipt, TrendingUp } from "lucide-react"

export default function Home() {
  const { user } = useAuth()
  const [activeView, setActiveView] = useState("dashboard")
  const [suppliers, setSuppliers] = useState([])
  const [invoices, setInvoices] = useState([])

  useEffect(() => {
    if (user) {
      setSuppliers(storage.suppliers.getAll())
      setInvoices(storage.invoices.getAll())
    }
  }, [user])

  if (!user) {
    return <LoginForm />
  }

  const stats = {
    totalSuppliers: suppliers.length,
    activeSuppliers: suppliers.filter((s) => s.status === "active").length,
    totalInvoices: invoices.length,
    pendingInvoices: invoices.filter((i) => i.status === "pending").length,
    totalValue: invoices.reduce((sum, inv) => sum + inv.total, 0),
    overdueInvoices: invoices.filter((i) => {
      return i.status === "pending" && new Date(i.dueDate) < new Date()
    }).length,
  }

  const renderContent = () => {
    switch (activeView) {
      case "suppliers":
        return <SupplierManagement />
      case "invoices":
        return <InvoiceManagement />
      case "vat":
        return <VATManagement />
      case "reports":
        return <ReportsDashboard />
      default:
        return (
          <div className="space-y-6">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-qb-primary to-qb-secondary p-6 rounded-lg text-white">
              <h1 className="text-2xl font-bold mb-2">Welcome back, {user.name}!</h1>
              <p className="text-qb-primary-light">Here's what's happening with your business today.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-qb-primary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Suppliers</CardTitle>
                  <Building2 className="h-4 w-4 text-qb-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalSuppliers}</div>
                  <p className="text-xs text-gray-500">{stats.activeSuppliers} active</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-qb-secondary">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Invoices</CardTitle>
                  <FileText className="h-4 w-4 text-qb-secondary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.totalInvoices}</div>
                  <p className="text-xs text-gray-500">{stats.pendingInvoices} pending</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-green-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Total Value</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">€{stats.totalValue.toLocaleString()}</div>
                  <p className="text-xs text-gray-500">All invoices</p>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600">Overdue</CardTitle>
                  <Receipt className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900">{stats.overdueInvoices}</div>
                  <p className="text-xs text-gray-500">Need attention</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
                <CardDescription>Get started with common tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button
                    onClick={() => setActiveView("suppliers")}
                    className="h-auto p-4 flex flex-col items-center space-y-2 bg-qb-primary hover:bg-qb-primary/90"
                  >
                    <Plus className="h-6 w-6" />
                    <span>Add Supplier</span>
                  </Button>
                  <Button
                    onClick={() => setActiveView("invoices")}
                    className="h-auto p-4 flex flex-col items-center space-y-2 bg-qb-secondary hover:bg-qb-secondary/90"
                  >
                    <FileText className="h-6 w-6" />
                    <span>New Invoice</span>
                  </Button>
                  <Button
                    onClick={() => setActiveView("vat")}
                    className="h-auto p-4 flex flex-col items-center space-y-2 bg-green-600 hover:bg-green-700"
                  >
                    <Calculator className="h-6 w-6" />
                    <span>VAT Report</span>
                  </Button>
                  <Button
                    onClick={() => setActiveView("reports")}
                    className="h-auto p-4 flex flex-col items-center space-y-2 bg-purple-600 hover:bg-purple-700"
                  >
                    <BarChart3 className="h-6 w-6" />
                    <span>View Reports</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Getting Started */}
            {stats.totalSuppliers === 0 && (
              <Card className="border-qb-primary/20 bg-qb-primary/5">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold text-qb-primary">Getting Started</CardTitle>
                  <CardDescription>Set up your supplier management system in a few easy steps</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-qb-primary text-white rounded-full flex items-center justify-center text-sm font-bold">
                      1
                    </div>
                    <div>
                      <p className="font-medium">Add your first supplier</p>
                      <p className="text-sm text-gray-600">Start by adding supplier information and contact details</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Create your first invoice</p>
                      <p className="text-sm text-gray-500">Process invoices manually or use OCR scanning</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-500">Generate VAT reports</p>
                      <p className="text-sm text-gray-500">Track VAT compliance and generate reports</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )
    }
  }

  return (
    <DashboardLayout activeTab={activeView} onTabChange={setActiveView}>
      {renderContent()}
    </DashboardLayout>
  )
}
