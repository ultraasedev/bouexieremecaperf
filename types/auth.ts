// types/auth.ts
import type { JWTPayload as JoseJWTPayload } from 'jose';

export interface UserPayload {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
}

export interface JWTPayload extends UserPayload, Partial<JoseJWTPayload> {
  iat?: number;
  exp?: number;
}