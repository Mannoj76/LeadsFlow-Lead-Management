import mongoose, { Schema, Document } from 'mongoose';

export interface ISystemSettings extends Document {
  companyName: string;
  companyEmail: string;
  companyPhone: string;
  dateFormat: string;
  timeFormat: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const SystemSettingsSchema = new Schema<ISystemSettings>(
  {
    companyName: {
      type: String,
      required: true,
      default: 'LeadsFlow CRM',
    },
    companyEmail: {
      type: String,
      default: '',
    },
    companyPhone: {
      type: String,
      default: '',
    },
    dateFormat: {
      type: String,
      default: 'MM/DD/YYYY',
    },
    timeFormat: {
      type: String,
      enum: ['12h', '24h'],
      default: '12h',
    },
    timezone: {
      type: String,
      default: 'UTC',
    },
  },
  {
    timestamps: true,
  }
);

export const SystemSettings = mongoose.model<ISystemSettings>('SystemSettings', SystemSettingsSchema);

