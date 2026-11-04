import { Schema, model, Document, Types } from 'mongoose';

export type AlertType = 'review' | 'critical';

export interface IAlert extends Document {
  cattleId: Types.ObjectId | string;
  cattleName: string;
  cattleTagId: string;
  scanId?: Types.ObjectId | string;
  type: AlertType;
  message: string;
  timestamp: string;
  confidence: number;
  resolved: boolean;
  resolvedAt?: Date;
  resolvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const alertSchema = new Schema<IAlert>(
  {
    cattleId: {
      type: Schema.Types.ObjectId,
      ref: 'Cattle',
      required: true,
      index: true,
    },
    cattleName: {
      type: String,
      required: true,
      trim: true,
    },
    cattleTagId: {
      type: String,
      required: true,
      trim: true,
    },
    scanId: {
      type: Schema.Types.ObjectId,
      ref: 'Scan',
    },
    type: {
      type: String,
      enum: ['review', 'critical'],
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    timestamp: {
      type: String,
      default: () => `Today · ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
      default: 85,
    },
    resolved: {
      type: Boolean,
      default: false,
      index: true,
    },
    resolvedAt: {
      type: Date,
    },
    resolvedBy: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        if (ret.cattleId && typeof ret.cattleId === 'object' && ret.cattleId._id) {
          ret.cattleId = ret.cattleId._id.toString();
        } else if (ret.cattleId) {
          ret.cattleId = ret.cattleId.toString();
        }
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Alert = model<IAlert>('Alert', alertSchema);
