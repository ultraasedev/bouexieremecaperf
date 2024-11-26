// types/client.ts
export type ClientType = 'individual' | 'company';

export interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  type: string;
  plate: string;
  vin?: string;
  clientId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CompanyInfo {
  name: string;
  siret: string;
  vatNumber?: string;
}

export interface IndividualInfo {
  firstName: string;
  lastName: string;
}

export interface BaseClient {
  id: string;
  email: string;
  phone: string;
  address: string;
  createdAt: Date;
  updatedAt: Date;
  vehicles: Vehicle[];
  appointments: {
    id: string;
    service: string;
    status: string;
  }[];
  invoices: {
    id: string;
    amount: number;
    status: string;
  }[];
}

export interface CompanyClient extends BaseClient {
  type: 'company';
  name: string;
  siret: string;
  vatNumber?: string;
  firstName?: never;
  lastName?: never;
}

export interface IndividualClient extends BaseClient {
  type: 'individual';
  firstName: string;
  lastName: string;
  name?: never;
  siret?: never;
  vatNumber?: never;
}

export type Client = CompanyClient | IndividualClient;

export interface ClientFormData {
  type: ClientType;
  name?: string;
  firstName?: string;
  lastName?: string;
  siret?: string;
  vatNumber?: string;
  email: string;
  phone: string;
  address: string;
}