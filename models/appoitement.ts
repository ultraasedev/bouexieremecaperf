// models/Appointment.ts
import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    service: { 
      type: String, 
      enum: ['Diagnostic', 'Mecanique', 'Piece_Premium', 'Reprog_Carto'],
      required: true 
    },
    vehicle: {
      brand: { type: String, required: true },
      model: { type: String, required: true },
      year: { type: Number, required: true }
    },
    description: { type: String },
    requestedDate: { type: Date, required: true },
    status: { 
      type: String, 
      enum: ['pending', 'confirmed', 'rejected', 'completed'],
      default: 'pending'
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });