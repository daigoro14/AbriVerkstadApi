import mongoose, { Schema, Document } from 'mongoose';

interface IAttraction extends Document {
  name: string;
  city: string;
  description: string;
  tags: string[];
  imageUrl: string;
}

const attractionSchema = new Schema<IAttraction>({
  name: { type: String, required: true },
  city: { type: String, required: true },
  description: { type: String, required: true },
  tags: { type: [String], required: true },
  imageUrl: { type: String, required: true },
});

// Define the Attraction model
const Attraction = mongoose.model<IAttraction>('Attraction', attractionSchema);

export default Attraction;
