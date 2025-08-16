"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useAuth } from "./auth-provider"
import { Building2, FileText, Calculator, BarChart3, LogOut, Menu, X, Home } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardLayout({ children, activeTab, onTabChange }: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navigation = [
    { id: "dashboard", name: "Dashboard", icon: Home },
    { id: "suppliers", name: "Suppliers", icon: Building2 },
    { id: "invoices", name: "Invoices", icon: FileText },
    { id: "vat", name: "VAT Reports", icon: Calculator },
    { id: "reports", name: "Reports", icon: BarChart3 },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border shadow-sm transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between h-16 px-6 border-b border-sidebar-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">B</span>
            </div>
            <h1 className="text-xl font-semibold text-sidebar-foreground">Bally</h1>
          </div>
          <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="mt-2 px-3">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center px-3 py-2.5 text-left rounded-lg transition-all duration-200 mb-1 ${
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                <span className="font-medium">{item.name}</span>
              </button>
            )
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-sidebar-border bg-sidebar">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-medium text-sm">{user?.name?.charAt(0) || "U"}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-muted-foreground hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        <div className="bg-card border-b border-border h-16 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="text-xl font-semibold text-foreground">
              {navigation.find((nav) => nav.id === activeTab)?.name || "Dashboard"}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </div>

        <main className="p-6 bg-background min-h-[calc(100vh-4rem)]">{children}</main>
      </div>
    </div>
  )
}
