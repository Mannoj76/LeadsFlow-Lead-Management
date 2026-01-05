import mongoose, { Schema, Document } from 'mongoose';

export interface ILeadSource extends Document {
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSourceSchema = new Schema<ILeadSource>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

export const LeadSource = mongoose.model<ILeadSource>('LeadSource', LeadSourceSchema);

