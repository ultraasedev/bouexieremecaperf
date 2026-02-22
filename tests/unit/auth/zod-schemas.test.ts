import { describe, it, expect } from 'vitest';
import {
  createClientSchema,
  updateClientSchema,
  updateQuoteSchema,
  updateAppointmentSchema,
} from '@/lib/validations';

describe('createClientSchema', () => {
  it('should validate a valid individual client', () => {
    const result = createClientSchema.safeParse({
      type: 'individual',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@exemple.fr',
      phone: '0612345678',
      address: '123 Rue de Paris, 22100 Dinan',
    });
    expect(result.success).toBe(true);
  });

  it('should validate a valid company client', () => {
    const result = createClientSchema.safeParse({
      type: 'company',
      name: 'Garage SA',
      siret: '12345678901234',
      email: 'contact@garage.fr',
      phone: '0212345678',
      address: '456 Av des Champs',
    });
    expect(result.success).toBe(true);
  });

  it('should reject individual client without firstName', () => {
    const result = createClientSchema.safeParse({
      type: 'individual',
      lastName: 'Dupont',
      email: 'jean@exemple.fr',
      phone: '0612345678',
      address: '123 Rue de Paris',
    });
    expect(result.success).toBe(false);
  });

  it('should reject company client without siret', () => {
    const result = createClientSchema.safeParse({
      type: 'company',
      name: 'Garage SA',
      email: 'contact@garage.fr',
      phone: '0212345678',
      address: '456 Av des Champs',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email format', () => {
    const result = createClientSchema.safeParse({
      type: 'individual',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'invalid-email',
      phone: '0612345678',
      address: '123 Rue de Paris',
    });
    expect(result.success).toBe(false);
  });

  it('should reject unknown client type', () => {
    const result = createClientSchema.safeParse({
      type: 'unknown',
      email: 'test@test.fr',
      phone: '0612345678',
      address: '123 Rue',
    });
    expect(result.success).toBe(false);
  });

  it('should reject empty phone', () => {
    const result = createClientSchema.safeParse({
      type: 'individual',
      firstName: 'Jean',
      lastName: 'Dupont',
      email: 'jean@test.fr',
      phone: '',
      address: '123 Rue',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateClientSchema', () => {
  it('should accept partial update with just email', () => {
    const result = updateClientSchema.safeParse({
      email: 'new@email.fr',
    });
    expect(result.success).toBe(true);
  });

  it('should accept empty object', () => {
    const result = updateClientSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should reject invalid email', () => {
    const result = updateClientSchema.safeParse({
      email: 'not-an-email',
    });
    expect(result.success).toBe(false);
  });
});

describe('updateQuoteSchema', () => {
  it('should accept status update', () => {
    const result = updateQuoteSchema.safeParse({
      status: 'SENT',
    });
    expect(result.success).toBe(true);
  });

  it('should accept items update', () => {
    const result = updateQuoteSchema.safeParse({
      items: [
        {
          description: 'Reprogrammation Stage 1',
          quantity: 1,
          unitPriceHT: 500,
          vatRate: 20,
        },
      ],
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = updateQuoteSchema.safeParse({
      status: 'INVALID_STATUS',
    });
    expect(result.success).toBe(false);
  });

  it('should accept totals update', () => {
    const result = updateQuoteSchema.safeParse({
      totalHT: 500,
      totalTTC: 600,
      totalVAT: 100,
      totalRemise: 0,
    });
    expect(result.success).toBe(true);
  });

  it('should accept passthrough fields for Prisma update', () => {
    const result = updateQuoteSchema.safeParse({
      status: 'DRAFT',
      updatedAt: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });
});

describe('updateAppointmentSchema', () => {
  it('should accept status update', () => {
    const result = updateAppointmentSchema.safeParse({
      status: 'CONFIRMED',
    });
    expect(result.success).toBe(true);
  });

  it('should accept date update', () => {
    const result = updateAppointmentSchema.safeParse({
      requestedDate: '2026-03-15T10:00:00.000Z',
    });
    expect(result.success).toBe(true);
  });

  it('should reject invalid status', () => {
    const result = updateAppointmentSchema.safeParse({
      status: 'INVALID',
    });
    expect(result.success).toBe(false);
  });

  it('should accept empty object', () => {
    const result = updateAppointmentSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('should accept combined date and status', () => {
    const result = updateAppointmentSchema.safeParse({
      requestedDate: '2026-03-15T10:00:00.000Z',
      status: 'MODIFIED',
    });
    expect(result.success).toBe(true);
  });

  it('should accept CANCELLED status', () => {
    const result = updateAppointmentSchema.safeParse({
      status: 'CANCELLED',
    });
    expect(result.success).toBe(true);
  });
});
