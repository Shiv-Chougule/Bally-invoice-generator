/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} email
 * @property {string} name
 * @property {string} role
 */

/**
 * @typedef {Object} Supplier
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} phone
 * @property {string} address
 * @property {string} vatNumber
 * @property {number} paymentTerms
 * @property {string} status
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} invoiceNumber
 * @property {string} supplierId
 * @property {Date} invoiceDate
 * @property {Date} dueDate
 * @property {number} subtotal
 * @property {number} vatRate
 * @property {number} vatAmount
 * @property {number} total
 * @property {string} status
 * @property {string} description
 * @property {string} [attachmentUrl]
 * @property {Date} createdAt
 */

/**
 * @typedef {Object} VATReport
 * @property {string} period
 * @property {number} totalVAT
 * @property {number} totalNet
 * @property {number} totalGross
 * @property {Array<Invoice>} invoices
 */

export {}
