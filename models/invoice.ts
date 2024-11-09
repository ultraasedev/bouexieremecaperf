// models/Invoice.ts
import mongoose from 'mongoose';

const invoiceSchema = new mongoose.Schema({
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    appointment: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
    amount: { type: Number, required: true },
    status: { 
      type: String, 
      enum: ['draft', 'sent', 'paid', 'overdue'],
      default: 'draft'
    },
    dueDate: { type: Date, required: true },
    items: [{
      description: String,
      quantity: Number,
      unitPrice: Number,
      total: Number
    }],
    createdAt: { type: Date, default: Date.now }
  });