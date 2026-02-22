// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  createInvoiceSchema,
  updateInvoiceSchema,
  cancelInvoiceSchema,
  createPaymentSchema,
} from '@/types/invoice';

describe('createInvoiceSchema', () => {
  const validData = {
    clientId: '507f1f77bcf86cd799439011',
    date: '2026-02-22',
    dueDate: '2026-03-22',
    items: [
      { description: 'Vidange moteur', quantity: 1, unitPriceHT: 50, vatRate: 0 },
    ],
    paymentDetails: { condition: 'upon_receipt' },
    totalHT: 50,
    totalTTC: 50,
    totalVAT: 0,
  };

  it('should validate correct invoice data', () => {
    const result = createInvoiceSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should reject missing clientId', () => {
    const result = createInvoiceSchema.safeParse({ ...validData, clientId: '' });
    expect(result.success).toBe(false);
  });

  it('should reject empty items array', () => {
    const result = createInvoiceSchema.safeParse({ ...validData, items: [] });
    expect(result.success).toBe(false);
  });

  it('should reject negative quantity', () => {
    const result = createInvoiceSchema.safeParse({
      ...validData,
      items: [{ description: 'Test', quantity: -1, unitPriceHT: 50, vatRate: 0 }],
    });
    expect(result.success).toBe(false);
  });

  it('should accept optional quoteId', () => {
    const result = createInvoiceSchema.safeParse({
      ...validData,
      quoteId: '507f1f77bcf86cd799439012',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional notes', () => {
    const result = createInvoiceSchema.safeParse({
      ...validData,
      notes: 'Note de test',
    });
    expect(result.success).toBe(true);
  });

  it('should set default totalDiscount to 0', () => {
    const result = createInvoiceSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalDiscount).toBe(0);
    }
  });
});

describe('updateInvoiceSchema', () => {
  it('should accept partial update', () => {
    const result = updateInvoiceSchema.safeParse({ notes: 'Mise à jour' });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = updateInvoiceSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should validate items if provided', () => {
    const result = updateInvoiceSchema.safeParse({
      items: [{ description: 'Test', quantity: 1, unitPriceHT: 100, vatRate: 0 }],
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid items', () => {
    const result = updateInvoiceSchema.safeParse({
      items: [{ description: '', quantity: -1, unitPriceHT: 100, vatRate: 0 }],
    });
    expect(result.success).toBe(false);
  });
});

describe('cancelInvoiceSchema', () => {
  it('should require a reason', () => {
    const result = cancelInvoiceSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('should reject empty reason', () => {
    const result = cancelInvoiceSchema.safeParse({ reason: '' });
    expect(result.success).toBe(false);
  });

  it('should accept valid reason', () => {
    const result = cancelInvoiceSchema.safeParse({ reason: 'Erreur de facturation' });
    expect(result.success).toBe(true);
  });

  it('should reject reason > 500 chars', () => {
    const result = cancelInvoiceSchema.safeParse({ reason: 'a'.repeat(501) });
    expect(result.success).toBe(false);
  });
});

describe('createPaymentSchema', () => {
  it('should validate correct payment data', () => {
    const result = createPaymentSchema.safeParse({
      amount: 100,
      method: 'TRANSFER',
    });
    expect(result.success).toBe(true);
  });

  it('should reject zero amount', () => {
    const result = createPaymentSchema.safeParse({
      amount: 0,
      method: 'CASH',
    });
    expect(result.success).toBe(false);
  });

  it('should reject negative amount', () => {
    const result = createPaymentSchema.safeParse({
      amount: -50,
      method: 'CASH',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid payment method', () => {
    const result = createPaymentSchema.safeParse({
      amount: 100,
      method: 'BITCOIN',
    });
    expect(result.success).toBe(false);
  });

  it('should accept all valid payment methods', () => {
    const methods = ['CASH', 'CHECK', 'TRANSFER', 'CARD', 'DIRECT_DEBIT'];
    methods.forEach((method) => {
      const result = createPaymentSchema.safeParse({ amount: 100, method });
      expect(result.success).toBe(true);
    });
  });

  it('should accept optional reference', () => {
    const result = createPaymentSchema.safeParse({
      amount: 100,
      method: 'CHECK',
      reference: 'CHQ-12345',
    });
    expect(result.success).toBe(true);
  });

  it('should accept optional notes', () => {
    const result = createPaymentSchema.safeParse({
      amount: 100,
      method: 'TRANSFER',
      notes: 'Virement reçu le 22/02',
    });
    expect(result.success).toBe(true);
  });
});
