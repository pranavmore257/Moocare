import { Schema, model, Document } from 'mongoose';

export type HealthStatus = 'healthy' | 'review' | 'concern' | 'critical';
export type CattleType = 'Dairy' | 'Beef' | 'Breeding';
export type CattleSex = 'Female' | 'Male';

export interface ICattle extends Document {
  name: string;
  tagId: string;
  breed: string;
  age: number;
  type: CattleType;
  sex: CattleSex;
  status: HealthStatus;
  lastChecked: string;
  color: string;
  weightKg?: number;
  lactationStage?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const cattleSchema = new Schema<ICattle>(
  {
    name: {
      type: String,
      required: [true, 'Animal name is required'],
      trim: true,
    },
    tagId: {
      type: String,
      required: [true, 'Tag ID is required'],
      unique: true,
      trim: true,
      index: true,
    },
    breed: {
      type: String,
      required: [true, 'Breed is required'],
      trim: true,
      default: 'Holstein Friesian',
    },
    age: {
      type: Number,
      required: [true, 'Age is required'],
      min: 0,
      max: 30,
      default: 3,
    },
    type: {
      type: String,
      enum: ['Dairy', 'Beef', 'Breeding'],
      default: 'Dairy',
    },
    sex: {
      type: String,
      enum: ['Female', 'Male'],
      default: 'Female',
    },
    status: {
      type: String,
      enum: ['healthy', 'review', 'concern', 'critical'],
      default: 'healthy',
      index: true,
    },
    lastChecked: {
      type: String,
      default: () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    },
    color: {
      type: String,
      default: '#2E7D5B',
    },
    weightKg: {
      type: Number,
      min: 0,
    },
    lactationStage: {
      type: String,
      trim: true,
    },
    notes: {
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
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Cattle = model<ICattle>('Cattle', cattleSchema);
