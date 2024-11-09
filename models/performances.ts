// src/models/Performance.ts
import mongoose from 'mongoose';

const performanceSchema = new mongoose.Schema({
  brand: { type: String, required: true },
  model: { type: String, required: true },
  year: { type: Number, required: true },
  stages: [{
    stage: { type: Number, enum: [1, 2, 3], required: true },
    horsePowerGain: { type: Number, required: true },
    torqueGain: { type: Number, required: true },
    description: { type: String, required: true }
  }]
});

export const Performance = mongoose.models.Performance || mongoose.model('Performance', performanceSchema);
