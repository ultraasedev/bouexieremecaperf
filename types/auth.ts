// types/auth.ts
export interface UserPayload {
  id: string;
  email: string | null;  // Permettre null pour email
  name: string | null;   // Permettre null pour name
  role: string;
}

export interface JWTPayload extends UserPayload {
  iat?: number;
  exp?: number;
}