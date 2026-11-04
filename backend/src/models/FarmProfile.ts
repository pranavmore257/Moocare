import { Schema, model, Document } from 'mongoose';

export interface IFarmProfile extends Document {
  farmName: string;
  ownerName: string;
  location: string;
  email: string;
  phone: string;
  totalCapacity: number;
  language: string;
  smsAlerts: boolean;
  pushNotifications: boolean;
  vetEmergencyNumber: string;
  createdAt: Date;
  updatedAt: Date;
}

const farmProfileSchema = new Schema<IFarmProfile>(
  {
    farmName: {
      type: String,
      required: true,
      default: 'Sharma Dairy Farm',
      trim: true,
    },
    ownerName: {
      type: String,
      required: true,
      default: 'Arjun Sharma',
      trim: true,
    },
    location: {
      type: String,
      required: true,
      default: 'Anand, Gujarat',
      trim: true,
    },
    email: {
      type: String,
      required: true,
      default: 'arjun.sharma@sharmadairy.in',
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      default: '+91 98765 43210',
      trim: true,
    },
    totalCapacity: {
      type: Number,
      default: 50,
    },
    language: {
      type: String,
      default: 'English',
    },
    smsAlerts: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    vetEmergencyNumber: {
      type: String,
      default: '+91 98250 12345',
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

export const FarmProfile = model<IFarmProfile>('FarmProfile', farmProfileSchema);
