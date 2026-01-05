import mongoose, { Schema, Document } from 'mongoose';

export interface IPipelineStage extends Document {
  name: string;
  order: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const PipelineStageSchema = new Schema<IPipelineStage>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    order: {
      type: Number,
      required: true,
      index: true,
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

export const PipelineStage = mongoose.model<IPipelineStage>('PipelineStage', PipelineStageSchema);

