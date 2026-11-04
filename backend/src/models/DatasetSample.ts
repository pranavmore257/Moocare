import { Schema, model, Document } from 'mongoose';

export interface IDatasetSample extends Document {
  datasetName: string;
  sampleId: string;
  tagId?: string;
  animalName?: string;
  breed?: string;
  age?: number;
  vocalizationType?: string;
  groundTruthLabel: string;
  predictedLabel?: string;
  confidence?: number;
  audioDurationSec?: number;
  audioFileName?: string;
  audioUrl?: string;
  sampleRateHz?: number;
  acousticFeatures?: {
    fundamentalFrequencyHz?: number;
    peakFrequencyHz?: number;
    harmonicsToNoiseRatio?: number;
    jitterPct?: number;
    shimmerPct?: number;
    spectralCentroid?: number;
    rmsEnergy?: number;
    decibels?: number;
  };
  context?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const datasetSampleSchema = new Schema<IDatasetSample>(
  {
    datasetName: {
      type: String,
      required: true,
      default: 'Primary Cattle Bioacoustics Dataset',
      index: true,
      trim: true,
    },
    sampleId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    tagId: {
      type: String,
      trim: true,
      index: true,
    },
    animalName: {
      type: String,
      trim: true,
    },
    breed: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: 0,
    },
    vocalizationType: {
      type: String,
      trim: true,
    },
    groundTruthLabel: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    predictedLabel: {
      type: String,
      trim: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    audioDurationSec: {
      type: Number,
      min: 0,
    },
    audioFileName: {
      type: String,
      trim: true,
    },
    audioUrl: {
      type: String,
      trim: true,
    },
    sampleRateHz: {
      type: Number,
      default: 44100,
    },
    acousticFeatures: {
      fundamentalFrequencyHz: { type: Number },
      peakFrequencyHz: { type: Number },
      harmonicsToNoiseRatio: { type: Number },
      jitterPct: { type: Number },
      shimmerPct: { type: Number },
      spectralCentroid: { type: Number },
      rmsEnergy: { type: Number },
      decibels: { type: Number },
    },
    context: {
      type: String,
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: Record<string, any>) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Compound index for fast queries
datasetSampleSchema.index({ datasetName: 1, groundTruthLabel: 1 });
datasetSampleSchema.index({ datasetName: 1, sampleId: 1 }, { unique: true });

export const DatasetSample = model<IDatasetSample>('DatasetSample', datasetSampleSchema);
