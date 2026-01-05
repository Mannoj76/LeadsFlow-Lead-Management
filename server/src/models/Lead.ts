import mongoose, { Schema, Document } from 'mongoose';

export interface ILead extends Document {
  name: string;
  phone: string;
  email?: string;
  source: string;
  status: string;
  assignedTo: mongoose.Types.ObjectId;
  leadType: 'individual' | 'business';
  companyName?: string;
  productInterest?: string;
  priority: 'high' | 'medium' | 'low';
  initialNotes?: string;
  customFields?: Map<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

const LeadSchema = new Schema<ILead>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      index: true,
    },
    source: {
      type: String,
      required: true,
      index: true,
    },
    status: {
      type: String,
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    leadType: {
      type: String,
      enum: ['individual', 'business'],
      default: 'individual',
      index: true,
    },
    companyName: {
      type: String,
      trim: true,
    },
    productInterest: {
      type: String,
      trim: true,
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
      index: true,
    },
    initialNotes: {
      type: String,
      trim: true,
    },
    customFields: {
      type: Map,
      of: String,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ updatedAt: -1 });
LeadSchema.index({ assignedTo: 1, status: 1 });
LeadSchema.index({ source: 1, createdAt: -1 });

export const Lead = mongoose.model<ILead>('Lead', LeadSchema);

