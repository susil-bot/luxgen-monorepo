export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  currency: string;
  method: 'credit_card' | 'bank_transfer' | 'paypal' | 'stripe';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  processedAt?: Date;
  createdAt: Date;
}

export class PaymentTracker {
  private payments: Map<string, Payment> = new Map();

  createPayment(paymentData: Omit<Payment, 'id' | 'createdAt'>): Payment {
    const payment: Payment = {
      id: this.generateId(),
      createdAt: new Date(),
      ...paymentData,
    };

    this.payments.set(payment.id, payment);
    return payment;
  }

  getPayment(id: string): Payment | undefined {
    return this.payments.get(id);
  }

  updatePayment(id: string, updates: Partial<Payment>): Payment | null {
    const payment = this.payments.get(id);
    if (!payment) return null;

    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  getPaymentsByInvoice(invoiceId: string): Payment[] {
    return Array.from(this.payments.values()).filter(
      payment => payment.invoiceId === invoiceId
    );
  }

  getPaymentsByStatus(status: Payment['status']): Payment[] {
    return Array.from(this.payments.values()).filter(
      payment => payment.status === status
    );
  }

  getPaymentStats(period: { start: Date; end: Date }): {
    totalAmount: number;
    totalCount: number;
    successRate: number;
    averageAmount: number;
  } {
    const payments = Array.from(this.payments.values()).filter(
      payment => payment.createdAt >= period.start && payment.createdAt <= period.end
    );

    const totalAmount = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalCount = payments.length;
    const successfulPayments = payments.filter(p => p.status === 'completed').length;
    const successRate = totalCount > 0 ? (successfulPayments / totalCount) * 100 : 0;
    const averageAmount = totalCount > 0 ? totalAmount / totalCount : 0;

    return {
      totalAmount,
      totalCount,
      successRate,
      averageAmount,
    };
  }

  private generateId(): string {
    return `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const paymentTracker = new PaymentTracker();
