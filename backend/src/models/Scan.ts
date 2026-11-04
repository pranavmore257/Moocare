import { Schema, model, Document, Types } from 'mongoose';
import type { HealthStatus } from './Cattle.js';

export interface IScanBreakdown {
  normal: number;
  stress: number;
  distress: number;
}

export interface IAcousticFeatures {
  meanPitchHz?: number;
  peakFrequencyHz?: number;
  decibels?: number;
  harmonicToNoiseRatio?: number;
  jitterPct?: number;
  shimmerPct?: number;
  spectralCentroid?: number;
}

export interface IScan extends Document {
  cattleId: Types.ObjectId | string;
  cattleTagId?: string;
  cattleName?: string;
  date: string;
  timestamp: string;
  status: HealthStatus;
  confidence: number;
  duration: number;
  breakdown: IScanBreakdown;
  audioUrl?: string;
  waveformData?: number[];
  acousticFeatures?: IAcousticFeatures;
  aiInsights?: string;
  vetReviewed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const scanSchema = new Schema<IScan>(
  {
    cattleId: {
      type: Schema.Types.ObjectId,
      ref: 'Cattle',
      required: [true, 'Cattle reference is required'],
      index: true,
    },
    cattleTagId: {
      type: String,
      trim: true,
    },
    cattleName: {
      type: String,
      trim: true,
    },
    date: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    },
    timestamp: {
      type: String,
      default: () => `Today · ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`,
    },
    status: {
      type: String,
      enum: ['healthy', 'review', 'concern', 'critical'],
      required: true,
      index: true,
    },
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    duration: {
      type: Number,
      required: true,
      default: 5.8,
    },
    breakdown: {
      normal: { type: Number, required: true, default: 70 },
      stress: { type: Number, required: true, default: 20 },
      distress: { type: Number, required: true, default: 10 },
    },
    audioUrl: {
      type: String,
      trim: true,
    },
    waveformData: {
      type: [Number],
      default: [6, 10, 16, 24, 32, 20, 38, 28, 44, 34, 20, 40, 48, 40, 20, 34, 44, 28, 38, 20, 32, 24, 16, 10, 6, 8],
    },
    acousticFeatures: {
      meanPitchHz: { type: Number },
      peakFrequencyHz: { type: Number },
      decibels: { type: Number },
      harmonicToNoiseRatio: { type: Number },
      jitterPct: { type: Number },
      shimmerPct: { type: Number },
      spectralCentroid: { type: Number },
    },
    aiInsights: {
      type: String,
      trim: true,
    },
    vetReviewed: {
      type: Boolean,
      default: false,
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

export const Scan = model<IScan>('Scan', scanSchema);
