// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockUpsert = vi.fn();
vi.mock('@/lib/prisma', () => ({
  prisma: {
    counter: {
      upsert: (...args: unknown[]) => mockUpsert(...args),
    },
  },
}));

import { getNextInvoiceNumber, getNextQuoteNumber } from '@/lib/invoiceNumber';

describe('getNextInvoiceNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate FA2026-000001 for first invoice', async () => {
    mockUpsert.mockResolvedValue({ name: 'invoice', year: 2026, sequence: 1 });

    const number = await getNextInvoiceNumber(2026);
    expect(number).toBe('FA2026-000001');
  });

  it('should generate FA2026-000042 for 42nd invoice', async () => {
    mockUpsert.mockResolvedValue({ name: 'invoice', year: 2026, sequence: 42 });

    const number = await getNextInvoiceNumber(2026);
    expect(number).toBe('FA2026-000042');
  });

  it('should pass correct upsert params', async () => {
    mockUpsert.mockResolvedValue({ name: 'invoice', year: 2026, sequence: 1 });

    await getNextInvoiceNumber(2026);

    expect(mockUpsert).toHaveBeenCalledWith({
      where: { name_year: { name: 'invoice', year: 2026 } },
      update: { sequence: { increment: 1 } },
      create: { name: 'invoice', year: 2026, sequence: 1 },
    });
  });

  it('should handle year change (2027)', async () => {
    mockUpsert.mockResolvedValue({ name: 'invoice', year: 2027, sequence: 1 });

    const number = await getNextInvoiceNumber(2027);
    expect(number).toBe('FA2027-000001');
  });

  it('should pad sequence to 6 digits', async () => {
    mockUpsert.mockResolvedValue({ name: 'invoice', year: 2026, sequence: 123456 });

    const number = await getNextInvoiceNumber(2026);
    expect(number).toBe('FA2026-123456');
  });
});

describe('getNextQuoteNumber', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should generate DEV2026-000001 for first quote', async () => {
    mockUpsert.mockResolvedValue({ name: 'quote', year: 2026, sequence: 1 });

    const number = await getNextQuoteNumber(2026);
    expect(number).toBe('DEV2026-000001');
  });

  it('should use "quote" as counter name', async () => {
    mockUpsert.mockResolvedValue({ name: 'quote', year: 2026, sequence: 1 });

    await getNextQuoteNumber(2026);

    expect(mockUpsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { name_year: { name: 'quote', year: 2026 } },
        create: expect.objectContaining({ name: 'quote' }),
      })
    );
  });
});
