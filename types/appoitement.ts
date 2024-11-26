// types/appointment.ts
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'MODIFIED' | 'COMPLETED';

export interface AppointmentVehicle {
  brand: string;
  model: string;
  year: number;
  trim?: string;
}

export interface AppointmentData {
  id: string;
  requestedDate: Date;
  service: string;
  vehicle: AppointmentVehicle;
  description?: string;
  status: AppointmentStatus;
  client: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    address: string;
    email: string;
    phone: string;
  };
}

export interface CreateAppointmentData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  brand: string;
  model: string;
  year: string;
  trim: string;
  serviceType: 'diagnostic' | 'mecanique' | 'pieces-premium' | 'reprog';
  description: string;
  date: string;
  time: string;
}
// types/appointment.ts
export interface AppointmentEmailData {
  firstName: string;
  lastName: string;
  fullname: string;
  email: string;
  date: string;
  time: string;
  brand: string;
  model: string;
  year: string;
  trim?: string;
  serviceType: string;
  description?: string; // Optionnel avec undefined
  appointmentId: string;
}
export interface ApiResponse {
  message?: string;
  error?: string;
}