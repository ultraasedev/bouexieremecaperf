// types/auth.ts

// Type de base pour l'utilisateur
export interface UserPayload {
  id: string;
  email: string | null;
  name: string | null;
  role: string;
}

// Type pour les JWT Claims standards
export interface JWTClaims {
  iat?: number;
  exp?: number;
}

// Type complet pour JWT avec index signature
export interface JWTData extends UserPayload, JWTClaims {
  [key: string]: string | number | null | undefined;
}