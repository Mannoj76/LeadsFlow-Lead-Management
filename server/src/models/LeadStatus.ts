import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadStatus extends Document {
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadStatusSchema = new Schema<ILeadStatus>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    color: {
      type: String,
      required: true,
      default: '#3b82f6',
    },
  },
  {
    timestamps: true,
  }
);

export const LeadStatus = mongoose.model<ILeadStatus>('LeadStatus', LeadStatusSchema);

