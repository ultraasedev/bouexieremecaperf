// types/appointment.ts
export interface AppointmentData {
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
  
  export interface ApiResponse {
    message?: string;
    error?: string;
  }