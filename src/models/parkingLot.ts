import { Document, Model, model, Types, Schema, Query } from 'mongoose';

// Schema
const ParkingLotSchema = new Schema({
  parkingLotName: {
    type: String,
  },
  availableSlots: {
    type: Number,
  },
  taxiQueue: {
    type: [String],
  },
});

export interface IParkingLot extends Document {
  availableSlots: number;
  parkingLotName: string;
  taxiQueue: Array<string>;
}

interface IParkingLotModel extends IParkingLot, Document {}

// Default export
export default model<IParkingLotModel>('ParkingLot', ParkingLotSchema);
