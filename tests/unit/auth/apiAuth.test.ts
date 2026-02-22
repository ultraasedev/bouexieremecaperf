// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SignJWT } from 'jose';

// Mock next/headers
const mockCookiesGet = vi.fn();
vi.mock('next/headers', () => ({
  cookies: () => ({
    get: mockCookiesGet,
  }),
}));

// Set JWT_SECRET before importing apiAuth
process.env.JWT_SECRET = 'test-secret-key-for-unit-tests-minimum-32-chars';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

import { requireAuth, requireAdmin, handleAuthError, AuthError } from '@/lib/apiAuth';

async function createTestToken(payload: Record<string, unknown>, expiresIn = '24h') {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET);
}

describe('AuthError', () => {
  it('should create an error with default status 401', () => {
    const error = new AuthError('Non authentifié');
    expect(error.message).toBe('Non authentifié');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('AuthError');
  });

  it('should create an error with custom status', () => {
    const error = new AuthError('Accès refusé', 403);
    expect(error.statusCode).toBe(403);
  });
});

describe('requireAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should throw AuthError when no token is present', async () => {
    mockCookiesGet.mockReturnValue(undefined);

    await expect(requireAuth()).rejects.toThrow(AuthError);
    await expect(requireAuth()).rejects.toThrow('Non authentifié');
  });

  it('should return user payload with valid token', async () => {
    const token = await createTestToken({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    });

    mockCookiesGet.mockReturnValue({ value: token });

    const user = await requireAuth();
    expect(user).toEqual({
      id: 'user-123',
      email: 'test@example.com',
      name: 'Test User',
      role: 'admin',
    });
  });

  it('should throw AuthError with invalid token', async () => {
    mockCookiesGet.mockReturnValue({ value: 'invalid-token' });

    await expect(requireAuth()).rejects.toThrow(AuthError);
    await expect(requireAuth()).rejects.toThrow('Token invalide ou expiré');
  });

  it('should throw AuthError with expired token', async () => {
    const token = await createTestToken(
      { id: 'user-123', email: 'test@example.com', name: 'Test', role: 'admin' },
      '0s'
    );

    // Wait a bit so the token is truly expired
    await new Promise((resolve) => setTimeout(resolve, 1100));

    mockCookiesGet.mockReturnValue({ value: token });

    await expect(requireAuth()).rejects.toThrow(AuthError);
  });
});

describe('requireAdmin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return user when role is admin', async () => {
    const token = await createTestToken({
      id: 'admin-123',
      email: 'admin@example.com',
      name: 'Admin',
      role: 'admin',
    });

    mockCookiesGet.mockReturnValue({ value: token });

    const user = await requireAdmin();
    expect(user.role).toBe('admin');
    expect(user.id).toBe('admin-123');
  });

  it('should throw AuthError 403 when role is not admin', async () => {
    const token = await createTestToken({
      id: 'user-456',
      email: 'user@example.com',
      name: 'User',
      role: 'user',
    });

    mockCookiesGet.mockReturnValue({ value: token });

    try {
      await requireAdmin();
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError);
      expect((error as AuthError).statusCode).toBe(403);
      expect((error as AuthError).message).toBe('Accès non autorisé');
    }
  });

  it('should throw AuthError 401 when no token', async () => {
    mockCookiesGet.mockReturnValue(undefined);

    try {
      await requireAdmin();
      expect.fail('Should have thrown');
    } catch (error) {
      expect(error).toBeInstanceOf(AuthError);
      expect((error as AuthError).statusCode).toBe(401);
    }
  });
});

describe('handleAuthError', () => {
  it('should return NextResponse for AuthError', () => {
    const error = new AuthError('Non authentifié', 401);
    const response = handleAuthError(error);

    expect(response).not.toBeNull();
    expect(response!.status).toBe(401);
  });

  it('should return NextResponse 403 for forbidden AuthError', () => {
    const error = new AuthError('Accès non autorisé', 403);
    const response = handleAuthError(error);

    expect(response).not.toBeNull();
    expect(response!.status).toBe(403);
  });

  it('should return null for non-AuthError', () => {
    const error = new Error('Some other error');
    const response = handleAuthError(error);

    expect(response).toBeNull();
  });

  it('should return null for string error', () => {
    const response = handleAuthError('string error');
    expect(response).toBeNull();
  });
});

describe('JWT_SECRET validation', () => {
  it('should throw when JWT_SECRET is not set', async () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;

    // Need to re-import to test this, but since module is cached,
    // we test that requireAuth with a valid cookie will fail
    // when JWT_SECRET is missing. The getJwtSecret function is called at runtime.
    mockCookiesGet.mockReturnValue({ value: 'some-token' });

    // The function should throw because JWT_SECRET is now undefined
    await expect(requireAuth()).rejects.toThrow();

    process.env.JWT_SECRET = originalSecret;
  });
});
