// types/tuning.ts
export interface Make {
    make_id: string;
    make_display: string;
    make_country: string;
  }
  
  export interface Model {
    model_name: string;
    model_make_id: string;
  }
  
  export interface Trim {
    model_id: string;
    model_make_id: string;
    model_name: string;
    model_trim: string;
    model_year: string;
    model_engine_cc: string;
    model_engine_fuel: string;
    model_engine_power_ps: string;
    model_engine_torque_nm: string;
    model_engine_type: string;
  }
  
  export interface TuningResult {
    originalPower: number;
    originalTorque: number;
    powerGain: number;
    torqueGain: number;
    newPower: number;
    newTorque: number;
    price: number | null;
  }
  
  export interface Selection {
    make: string;
    year: number;
    model: string;
    trim: Trim | null;
  }
  
  export interface CarQueryResponse {
    Makes?: Make[];
    Models?: Model[];
    Trims?: Trim[];
  }