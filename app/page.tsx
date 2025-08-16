"use client"

import { useAuth } from "@/components/auth-provider"
import { LoginForm } from "@/components/login-form"
import { DashboardLayout } from "@/components/dashboard-layout"
import { SupplierManagement } from "@/components/supplier-management"
import { InvoiceManagement } from "@/components/invoice-management"
import { VATManagement } from "@/components/vat-management"
import { ReportsDashboard } from "@/components/reports-dashboard"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, FileText, Calculator, TrendingUp } from "lucide-react"
import { storage } from "@/lib/storage"

function DashboardOverview() {
  const [stats, setStats] = useState({
    totalSuppliers: 0,
    pendingInvoices: 0,
    monthlyVAT: 0,
    totalProcessed: 0,
  })

  useEffect(() => {
    const suppliers = storage.suppliers.getAll()
    const invoices = storage.invoices.getAll()

    setStats({
      totalSuppliers: suppliers.length,
      pendingInvoices: invoices.filter((inv) => inv.status === "pending").length,
      monthlyVAT: invoices
        .filter((inv) => new Date(inv.date).getMonth() === new Date().getMonth())
        .reduce((sum, inv) => sum + inv.vatAmount, 0),
      totalProcessed: invoices.reduce((sum, inv) => sum + inv.total, 0),
    })
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalSuppliers === 0 ? "No suppliers added yet" : "Active suppliers"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingInvoices === 0 ? "No pending invoices" : "Awaiting processing"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly VAT</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.monthlyVAT.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Current month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Processed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">€{stats.totalProcessed.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Welcome to Bally Supplier Management</CardTitle>
          <CardDescription>Manage your suppliers, process invoices, and track VAT efficiently</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Building2 className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <h3 className="font-medium">Supplier Management</h3>
                <p className="text-sm text-gray-600">
                  Add and manage your supplier database with contact details and payment terms
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h3 className="font-medium">Invoice Processing</h3>
                <p className="text-sm text-gray-600">
                  Scan, process, and track invoices with automatic VAT calculations
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Calculator className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <h3 className="font-medium">VAT Reporting</h3>
                <p className="text-sm text-gray-600">
                  Generate comprehensive VAT reports for compliance and accounting
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function Home() {
  const { user, isLoading } = useAuth()
  const [activeTab, setActiveTab] = useState("dashboard")

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <LoginForm />
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "suppliers":
        return <SupplierManagement />
      case "invoices":
        return <InvoiceManagement />
      case "vat":
        return <VATManagement />
      case "reports":
        return <ReportsDashboard />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  )
}
