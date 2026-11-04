export type Screen =
  | 'splash'
  | 'onboarding'
  | 'login'
  | 'home'
  | 'record'
  | 'analysis'
  | 'result'
  | 'cattle-profile'
  | 'add-animal'
  | 'herd'
  | 'alerts'
  | 'profile'
  | 'vet-review'
  | 'expert-system';

export type HealthStatus = 'healthy' | 'review' | 'concern' | 'critical';

export type NavTab = 'home' | 'record' | 'herd' | 'alerts' | 'profile';

export type UserRole = 'farmer' | 'vet' | 'manager';

export interface Cattle {
  id: string;
  name: string;
  tagId: string;
  breed: string;
  age: number;
  type: 'Dairy' | 'Beef' | 'Breeding';
  sex: 'Female' | 'Male';
  status: HealthStatus;
  lastChecked: string;
  color: string;
}

export interface Scan {
  id: string;
  cattleId: string;
  date: string;
  timestamp: string;
  status: HealthStatus;
  confidence: number;
  duration: number;
  breakdown: {
    normal: number;
    stress: number;
    distress: number;
  };
}

export interface Alert {
  id: string;
  cattleId: string;
  cattleName: string;
  cattleTagId: string;
  type: 'review' | 'critical';
  message: string;
  timestamp: string;
  confidence: number;
  resolved: boolean;
}

export interface XAIAttribution {
  feature: string;
  value: string;
  impactScore: number;
  description: string;
}

export interface NavigateOptions {
  cattleId?: string;
  analysisResult?: HealthStatus;
  confidence?: number;
  audioFileName?: string;
  audioUrl?: string;
  duration?: number;
  breakdown?: {
    normal: number;
    stress: number;
    distress: number;
  };
  acousticFeatures?: {
    meanPitchHz: number;
    peakFrequencyHz: number;
    harmonicToNoiseRatio: number;
    jitterPct: number;
    shimmerPct: number;
    spectralCentroid: number;
    decibels: number;
  };
  aiInsights?: string;
  xaiAttributions?: XAIAttribution[];
}

export type NavigateFn = (screen: Screen, options?: NavigateOptions) => void;

export interface ScreenProps {
  navigate: NavigateFn;
  options: NavigateOptions;
  role?: UserRole;
}
