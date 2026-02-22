// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';

vi.mock('@/lib/prisma', () => ({ prisma: {} }));

import { getDefaultLegalNotices } from '@/lib/invoiceUtils';

describe('getDefaultLegalNotices', () => {
  it('should return all 4 legal notice fields', () => {
    const notices = getDefaultLegalNotices();
    expect(notices).toHaveProperty('generalConditions');
    expect(notices).toHaveProperty('paymentPenalties');
    expect(notices).toHaveProperty('recoveryIndemnity');
    expect(notices).toHaveProperty('vatRegime');
  });

  it('should mention art. 293 B du CGI', () => {
    const notices = getDefaultLegalNotices();
    expect(notices.vatRegime).toContain('293 B du CGI');
  });

  it('should mention auto-entrepreneur', () => {
    const notices = getDefaultLegalNotices();
    expect(notices.generalConditions).toContain('Auto-entrepreneur');
  });

  it('should mention 10.4% penalty rate', () => {
    const notices = getDefaultLegalNotices();
    expect(notices.paymentPenalties).toContain('10.4');
  });

  it('should mention 40€ recovery indemnity', () => {
    const notices = getDefaultLegalNotices();
    expect(notices.recoveryIndemnity).toContain('40€');
  });

  it('should mention RCS and RM exemption', () => {
    const notices = getDefaultLegalNotices();
    expect(notices.generalConditions).toContain('RCS');
    expect(notices.generalConditions).toContain('RM');
  });
});
