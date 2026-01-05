import mongoose, { Schema, Document } from 'mongoose';

export interface IFollowUp extends Document {
  leadId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  assignedTo: mongoose.Types.ObjectId;
  dueDate: Date;
  dueTime: string;
  notes: string;
  isCompleted: boolean;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    leadId: {
      type: Schema.Types.ObjectId,
      ref: 'Lead',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
    dueTime: {
      type: String,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
FollowUpSchema.index({ assignedTo: 1, dueDate: 1, isCompleted: 1 });
FollowUpSchema.index({ leadId: 1, createdAt: -1 });

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', FollowUpSchema);

