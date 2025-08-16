/**
 * Storage utility functions for managing data in localStorage
 */

const STORAGE_KEYS = {
  USER: "bally_user",
  SUPPLIERS: "bally_suppliers",
  INVOICES: "bally_invoices",
}

/**
 * @param {User} user
 */
export const saveUser = (user) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user))
  }
}

/**
 * @returns {User | null}
 */
export const getUser = () => {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem(STORAGE_KEYS.USER)
    return user ? JSON.parse(user) : null
  }
  return null
}

export const clearUser = () => {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEYS.USER)
  }
}

/**
 * @returns {Array<Supplier>}
 */
export const getSuppliers = () => {
  if (typeof window !== "undefined") {
    const suppliers = localStorage.getItem(STORAGE_KEYS.SUPPLIERS)
    return suppliers ? JSON.parse(suppliers) : []
  }
  return []
}

/**
 * @param {Array<Supplier>} suppliers
 */
export const saveSuppliers = (suppliers) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.SUPPLIERS, JSON.stringify(suppliers))
  }
}

/**
 * @returns {Array<Invoice>}
 */
export const getInvoices = () => {
  if (typeof window !== "undefined") {
    const invoices = localStorage.getItem(STORAGE_KEYS.INVOICES)
    return invoices
      ? JSON.parse(invoices).map((invoice) => ({
          ...invoice,
          invoiceDate: new Date(invoice.invoiceDate),
          dueDate: new Date(invoice.dueDate),
          createdAt: new Date(invoice.createdAt),
        }))
      : []
  }
  return []
}

/**
 * @param {Array<Invoice>} invoices
 */
export const saveInvoices = (invoices) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices))
  }
}

/**
 * Storage API object that provides organized access to all storage functions
 */
export const storage = {
  // User management
  user: {
    save: saveUser,
    get: getUser,
    clear: clearUser,
  },

  // Supplier management
  suppliers: {
    getAll: getSuppliers,
    add: (supplierData) => {
      const suppliers = getSuppliers()
      const newSupplier = {
        id: Date.now().toString(),
        ...supplierData,
        createdAt: new Date(),
      }
      const updatedSuppliers = [...suppliers, newSupplier]
      saveSuppliers(updatedSuppliers)
      return newSupplier
    },
    update: (id, supplierData) => {
      const suppliers = getSuppliers()
      const index = suppliers.findIndex((s) => s.id === id)
      if (index === -1) return null

      const updatedSupplier = {
        ...suppliers[index],
        ...supplierData,
        updatedAt: new Date(),
      }
      suppliers[index] = updatedSupplier
      saveSuppliers(suppliers)
      return updatedSupplier
    },
    delete: (id) => {
      const suppliers = getSuppliers()
      const filteredSuppliers = suppliers.filter((s) => s.id !== id)
      saveSuppliers(filteredSuppliers)
      return true
    },
  },

  // Invoice management
  invoices: {
    getAll: getInvoices,
    add: (invoiceData) => {
      const invoices = getInvoices()
      const newInvoice = {
        id: Date.now().toString(),
        ...invoiceData,
        createdAt: new Date(),
      }
      const updatedInvoices = [...invoices, newInvoice]
      saveInvoices(updatedInvoices)
      return newInvoice
    },
    update: (id, invoiceData) => {
      const invoices = getInvoices()
      const index = invoices.findIndex((i) => i.id === id)
      if (index === -1) return null

      const updatedInvoice = {
        ...invoices[index],
        ...invoiceData,
        updatedAt: new Date(),
      }
      invoices[index] = updatedInvoice
      saveInvoices(invoices)
      return updatedInvoice
    },
    delete: (id) => {
      const invoices = getInvoices()
      const filteredInvoices = invoices.filter((i) => i.id !== id)
      saveInvoices(filteredInvoices)
      return true
    },
  },
}
