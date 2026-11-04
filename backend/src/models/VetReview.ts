import { Schema, model, Document, Types } from 'mongoose';

export type VetReviewStatus = 'pending' | 'reviewed' | 'escalated';

export interface IVetReview extends Document {
  cattleId: Types.ObjectId | string;
  cattleName: string;
  cattleTagId: string;
  scanId?: Types.ObjectId | string;
  status: VetReviewStatus;
  priority: 'normal' | 'urgent';
  farmerMessage: string;
  vetFeedback?: string;
  assignedVet?: string;
  requestedAt: Date;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const vetReviewSchema = new Schema<IVetReview>(
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
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'escalated'],
      default: 'pending',
      index: true,
    },
    priority: {
      type: String,
      enum: ['normal', 'urgent'],
      default: 'normal',
    },
    farmerMessage: {
      type: String,
      required: true,
      trim: true,
      default: 'Please review this cattle vocalization and associated health record.',
    },
    vetFeedback: {
      type: String,
      trim: true,
    },
    assignedVet: {
      type: String,
      trim: true,
      default: 'Dr. K. Patel (Senior Bovine Specialist)',
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: {
      type: Date,
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

export const VetReview = model<IVetReview>('VetReview', vetReviewSchema);
