// models/Booking.ts
import mongoose, { Schema, Document, Types } from 'mongoose';

export interface BookingDocument extends Document {
  carReg: string;
  fromDate: string; // Format: YYYY-MM-DD
  toDate: string;
  comment?: string;
  createdBy: Types.ObjectId
}

const bookingSchema = new Schema<BookingDocument>({
  carReg: { type: String, required: true },
  fromDate: { type: String, required: true },
  toDate: { type: String, required: true },
  comment: { type: String },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  timestamps: true, // adds createdAt and updatedAt
});

// Optional: index for querying efficiency
bookingSchema.index({ carReg: 1, fromDate: 1, toDate: 1 });

const Booking = mongoose.model<BookingDocument>('Booking', bookingSchema);

export default Booking;
