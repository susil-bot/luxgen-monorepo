export interface Invoice {
  id: string;
  tenantId: string;
  userId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  dueDate: Date;
  items: InvoiceItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export class InvoiceManager {
  private invoices: Map<string, Invoice> = new Map();

  createInvoice(invoiceData: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt'>): Invoice {
    const invoice: Invoice = {
      id: this.generateId(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...invoiceData,
    };

    this.invoices.set(invoice.id, invoice);
    return invoice;
  }

  getInvoice(id: string): Invoice | undefined {
    return this.invoices.get(id);
  }

  updateInvoice(id: string, updates: Partial<Invoice>): Invoice | null {
    const invoice = this.invoices.get(id);
    if (!invoice) return null;

    const updatedInvoice = { 
      ...invoice, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  getInvoicesByTenant(tenantId: string): Invoice[] {
    return Array.from(this.invoices.values()).filter(
      invoice => invoice.tenantId === tenantId
    );
  }

  getInvoicesByUser(userId: string): Invoice[] {
    return Array.from(this.invoices.values()).filter(
      invoice => invoice.userId === userId
    );
  }

  getOverdueInvoices(): Invoice[] {
    const now = new Date();
    return Array.from(this.invoices.values()).filter(
      invoice => invoice.dueDate < now && invoice.status !== 'paid'
    );
  }

  private generateId(): string {
    return `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const invoiceManager = new InvoiceManager();
