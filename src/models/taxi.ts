import { Document, Model, model, Types, Schema, Query } from 'mongoose';

// Schema
const TaxiSchema = new Schema({
  taxiNumber: {
    type: String,
    required: true,
  },
  lastLocationLatitude: {
    type: Number,
  },
  lastLocationLongitude: {
    type: Number,
  },
});

export interface ITaxi extends Document {
  taxiNumber: string;
  lastLocationLatitude: number;
  lastLocationLongitude: number;
}

interface ITaxiModel extends ITaxi, Document {}

// Default export
export default model<ITaxiModel>('Taxi', TaxiSchema);
