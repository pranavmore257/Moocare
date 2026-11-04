import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db.js';
import { Cattle } from '../models/Cattle.js';
import { Scan } from '../models/Scan.js';
import { Alert } from '../models/Alert.js';
import { FarmProfile } from '../models/FarmProfile.js';
import { DatasetSample } from '../models/DatasetSample.js';

const INITIAL_CATTLE = [
  {
    name: 'Gauri',
    tagId: '#245',
    breed: 'Holstein Friesian',
    age: 4,
    type: 'Dairy' as const,
    sex: 'Female' as const,
    status: 'healthy' as const,
    lastChecked: 'Today · 10:42 AM',
    color: '#5B8E6E',
    weightKg: 580,
    lactationStage: 'Peak lactation (2nd parity)',
  },
  {
    name: 'Lakshmi',
    tagId: '#218',
    breed: 'Jersey',
    age: 3,
    type: 'Dairy' as const,
    sex: 'Female' as const,
    status: 'review' as const,
    lastChecked: 'Today · 09:16 AM',
    color: '#B07D55',
    weightKg: 460,
    lactationStage: 'Mid lactation (1st parity)',
  },
  {
    name: 'Kamdhenu',
    tagId: '#302',
    breed: 'Gir',
    age: 5,
    type: 'Dairy' as const,
    sex: 'Female' as const,
    status: 'concern' as const,
    lastChecked: 'Yesterday · 04:15 PM',
    color: '#8B6F47',
    weightKg: 510,
    lactationStage: 'Late lactation (3rd parity)',
  },
  {
    name: 'Radha',
    tagId: '#167',
    breed: 'Sahiwal',
    age: 6,
    type: 'Dairy' as const,
    sex: 'Female' as const,
    status: 'healthy' as const,
    lastChecked: 'Sep 28 · 11:30 AM',
    color: '#6B8E7A',
    weightKg: 495,
    lactationStage: 'Dry period',
  },
  {
    name: 'Nandini',
    tagId: '#189',
    breed: 'Crossbreed',
    age: 2,
    type: 'Dairy' as const,
    sex: 'Female' as const,
    status: 'healthy' as const,
    lastChecked: 'Sep 29 · 08:20 AM',
    color: '#9E7060',
    weightKg: 420,
    lactationStage: 'Heifer / Pre-calving',
  },
  {
    name: 'Surabhi',
    tagId: '#334',
    breed: 'Holstein Friesian',
    age: 3,
    type: 'Dairy' as const,
    sex: 'Female' as const,
    status: 'review' as const,
    lastChecked: 'Sep 29 · 03:00 PM',
    color: '#7A8B9B',
    weightKg: 550,
    lactationStage: 'Early lactation (1st parity)',
  },
];

async function seed() {
  try {
    console.log('[Seed] Connecting to MongoDB...');
    await connectDB();

    console.log('[Seed] Clearing existing collections...');
    await Promise.all([
      Cattle.deleteMany({}),
      Scan.deleteMany({}),
      Alert.deleteMany({}),
      FarmProfile.deleteMany({}),
      DatasetSample.deleteMany({ datasetName: 'MooCare Baseline Bioacoustic Dataset' }),
    ]);

    console.log('[Seed] Seeding Cattle herd...');
    const createdCattle = await Cattle.insertMany(INITIAL_CATTLE);
    console.log(`[Seed] Created ${createdCattle.length} cattle records.`);

    // Mapping by name
    const cowMap = new Map<string, (typeof createdCattle)[0]>();
    for (const c of createdCattle) {
      cowMap.set(c.name, c);
    }

    console.log('[Seed] Seeding Scans...');
    const gauri = cowMap.get('Gauri')!;
    const lakshmi = cowMap.get('Lakshmi')!;
    const kamdhenu = cowMap.get('Kamdhenu')!;
    const radha = cowMap.get('Radha')!;

    const scansData = [
      {
        cattleId: gauri._id,
        cattleName: gauri.name,
        cattleTagId: gauri.tagId,
        date: 'Sep 30',
        timestamp: 'Today · 10:42 AM',
        status: 'healthy' as const,
        confidence: 94,
        duration: 5.8,
        breakdown: { normal: 72, stress: 20, distress: 8 },
        acousticFeatures: { meanPitchHz: 142, peakFrequencyHz: 310, harmonicToNoiseRatio: 22.4, jitterPct: 1.1, decibels: 72 },
        aiInsights: 'Normal contact vocalization. Clear harmonic stack, minimal vocal fry or strain.',
      },
      {
        cattleId: lakshmi._id,
        cattleName: lakshmi.name,
        cattleTagId: lakshmi.tagId,
        date: 'Sep 30',
        timestamp: 'Today · 09:16 AM',
        status: 'review' as const,
        confidence: 82,
        duration: 6.2,
        breakdown: { normal: 45, stress: 38, distress: 17 },
        acousticFeatures: { meanPitchHz: 215, peakFrequencyHz: 480, harmonicToNoiseRatio: 16.1, jitterPct: 2.4, decibels: 76 },
        aiInsights: 'Slight frequency elevation. Suggest checking feed bunk and ambient shed temperature.',
      },
      {
        cattleId: kamdhenu._id,
        cattleName: kamdhenu.name,
        cattleTagId: kamdhenu.tagId,
        date: 'Sep 29',
        timestamp: 'Yesterday · 04:15 PM',
        status: 'concern' as const,
        confidence: 87,
        duration: 5.4,
        breakdown: { normal: 18, stress: 42, distress: 40 },
        acousticFeatures: { meanPitchHz: 312, peakFrequencyHz: 720, harmonicToNoiseRatio: 12.8, jitterPct: 3.9, decibels: 84 },
        aiInsights: 'High fundamental frequency modulation and rapid pulse intervals indicating potential pain or distress.',
      },
      {
        cattleId: radha._id,
        cattleName: radha.name,
        cattleTagId: radha.tagId,
        date: 'Sep 28',
        timestamp: 'Sep 28 · 11:30 AM',
        status: 'healthy' as const,
        confidence: 91,
        duration: 6.0,
        breakdown: { normal: 78, stress: 16, distress: 6 },
        acousticFeatures: { meanPitchHz: 135, peakFrequencyHz: 295, harmonicToNoiseRatio: 24.1, jitterPct: 0.9, decibels: 68 },
        aiInsights: 'Calm rumination call with balanced formants.',
      },
      {
        cattleId: gauri._id,
        cattleName: gauri.name,
        cattleTagId: gauri.tagId,
        date: 'Sep 28',
        timestamp: 'Sep 28 · 09:00 AM',
        status: 'review' as const,
        confidence: 78,
        duration: 5.2,
        breakdown: { normal: 55, stress: 30, distress: 15 },
        acousticFeatures: { meanPitchHz: 190, peakFrequencyHz: 410, harmonicToNoiseRatio: 17.5, jitterPct: 2.1, decibels: 74 },
        aiInsights: 'Low confidence scan due to ambient wind noise.',
      },
      {
        cattleId: gauri._id,
        cattleName: gauri.name,
        cattleTagId: gauri.tagId,
        date: 'Sep 24',
        timestamp: 'Sep 24 · 02:30 PM',
        status: 'healthy' as const,
        confidence: 91,
        duration: 6.0,
        breakdown: { normal: 78, stress: 16, distress: 6 },
        acousticFeatures: { meanPitchHz: 138, peakFrequencyHz: 305, harmonicToNoiseRatio: 23.0, jitterPct: 1.0, decibels: 70 },
        aiInsights: 'Clean vocalization within baseline.',
      },
    ];

    const createdScans = await Scan.insertMany(scansData);
    console.log(`[Seed] Created ${createdScans.length} acoustic scan records.`);

    console.log('[Seed] Seeding Alerts...');
    const alertsData = [
      {
        cattleId: kamdhenu._id,
        cattleName: kamdhenu.name,
        cattleTagId: kamdhenu.tagId,
        type: 'critical' as const,
        message: 'Repeated abnormal vocalizations detected',
        timestamp: 'Today · 09:14 AM',
        confidence: 87,
        resolved: false,
      },
      {
        cattleId: lakshmi._id,
        cattleName: lakshmi.name,
        cattleTagId: lakshmi.tagId,
        type: 'review' as const,
        message: 'Potential abnormal vocal pattern detected',
        timestamp: '10 minutes ago',
        confidence: 82,
        resolved: false,
      },
      {
        cattleId: gauri._id,
        cattleName: gauri.name,
        cattleTagId: gauri.tagId,
        type: 'review' as const,
        message: 'Low confidence result — re-check recommended',
        timestamp: 'Sep 28 · 09:00 AM',
        confidence: 78,
        resolved: true,
        resolvedAt: new Date('2026-09-28T09:30:00Z'),
        resolvedBy: 'Arjun Sharma',
      },
    ];

    const createdAlerts = await Alert.insertMany(alertsData);
    console.log(`[Seed] Created ${createdAlerts.length} alert records.`);

    console.log('[Seed] Seeding Farm Profile...');
    await FarmProfile.create({
      farmName: 'Sharma Dairy Farm',
      ownerName: 'Arjun Sharma',
      location: 'Anand, Gujarat',
      email: 'arjun.sharma@sharmadairy.in',
      phone: '+91 98765 43210',
      totalCapacity: 50,
      language: 'English',
      smsAlerts: true,
      pushNotifications: true,
      vetEmergencyNumber: '+91 98250 12345',
    });

    console.log('[Seed] Seeding Baseline Bioacoustic Dataset samples...');
    const datasetSamples = [
      {
        datasetName: 'MooCare Baseline Bioacoustic Dataset',
        sampleId: 'MC-VOC-001',
        tagId: '#245',
        animalName: 'Gauri',
        breed: 'Holstein Friesian',
        age: 4,
        vocalizationType: 'Contact Call (Relaxed)',
        groundTruthLabel: 'healthy',
        predictedLabel: 'healthy',
        confidence: 95,
        audioDurationSec: 5.8,
        acousticFeatures: {
          fundamentalFrequencyHz: 142,
          peakFrequencyHz: 310,
          harmonicsToNoiseRatio: 22.4,
          jitterPct: 1.1,
          shimmerPct: 2.8,
          decibels: 72,
        },
        context: 'Post-feeding rumination call recorded in open stall',
      },
      {
        datasetName: 'MooCare Baseline Bioacoustic Dataset',
        sampleId: 'MC-VOC-002',
        tagId: '#218',
        animalName: 'Lakshmi',
        breed: 'Jersey',
        age: 3,
        vocalizationType: 'Isolation Moos',
        groundTruthLabel: 'review',
        predictedLabel: 'review',
        confidence: 84,
        audioDurationSec: 6.2,
        acousticFeatures: {
          fundamentalFrequencyHz: 215,
          peakFrequencyHz: 480,
          harmonicsToNoiseRatio: 16.1,
          jitterPct: 2.4,
          shimmerPct: 4.9,
          decibels: 76,
        },
        context: 'Recorded during milking separation',
      },
      {
        datasetName: 'MooCare Baseline Bioacoustic Dataset',
        sampleId: 'MC-VOC-003',
        tagId: '#302',
        animalName: 'Kamdhenu',
        breed: 'Gir',
        age: 5,
        vocalizationType: 'Acute Pain / Distress',
        groundTruthLabel: 'concern',
        predictedLabel: 'concern',
        confidence: 89,
        audioDurationSec: 5.4,
        acousticFeatures: {
          fundamentalFrequencyHz: 312,
          peakFrequencyHz: 720,
          harmonicsToNoiseRatio: 12.8,
          jitterPct: 3.9,
          shimmerPct: 7.2,
          decibels: 84,
        },
        context: 'Limping observed on hind right hoof; mastitis screening ordered',
      },
      {
        datasetName: 'MooCare Baseline Bioacoustic Dataset',
        sampleId: 'MC-VOC-004',
        tagId: '#167',
        animalName: 'Radha',
        breed: 'Sahiwal',
        age: 6,
        vocalizationType: 'Low-Frequency Ruminating',
        groundTruthLabel: 'healthy',
        predictedLabel: 'healthy',
        confidence: 93,
        audioDurationSec: 6.0,
        acousticFeatures: {
          fundamentalFrequencyHz: 135,
          peakFrequencyHz: 295,
          harmonicsToNoiseRatio: 24.1,
          jitterPct: 0.9,
          shimmerPct: 2.3,
          decibels: 68,
        },
        context: 'Shade rest during midday heat',
      },
      {
        datasetName: 'MooCare Baseline Bioacoustic Dataset',
        sampleId: 'MC-VOC-005',
        tagId: '#334',
        animalName: 'Surabhi',
        breed: 'Holstein Friesian',
        age: 3,
        vocalizationType: 'Estrus Vocalization Pattern',
        groundTruthLabel: 'review',
        predictedLabel: 'review',
        confidence: 81,
        audioDurationSec: 4.8,
        acousticFeatures: {
          fundamentalFrequencyHz: 260,
          peakFrequencyHz: 540,
          harmonicsToNoiseRatio: 15.2,
          jitterPct: 2.8,
          shimmerPct: 5.1,
          decibels: 79,
        },
        context: 'Increased restlessness and repeated vocalizing, suspected estrus onset',
      },
      {
        datasetName: 'MooCare Baseline Bioacoustic Dataset',
        sampleId: 'MC-VOC-006',
        tagId: '#105',
        animalName: 'Bhavani',
        breed: 'Crossbreed',
        age: 4,
        vocalizationType: 'Severe Respiratory Distress',
        groundTruthLabel: 'critical',
        predictedLabel: 'critical',
        confidence: 96,
        audioDurationSec: 6.5,
        acousticFeatures: {
          fundamentalFrequencyHz: 385,
          peakFrequencyHz: 920,
          harmonicsToNoiseRatio: 9.4,
          jitterPct: 5.2,
          shimmerPct: 9.8,
          decibels: 88,
        },
        context: 'Severe wheezing, heavy nasal discharge; emergency vet intervention flagged',
      },
    ];

    await DatasetSample.insertMany(datasetSamples);
    console.log(`[Seed] Created ${datasetSamples.length} baseline dataset samples.`);

    console.log('\n✅ [Seed] Database successfully seeded with full initial herd, scans, alerts, and dataset!');
    await disconnectDB();
    process.exit(0);
  } catch (error) {
    console.error('❌ [Seed] Error during seeding:', error);
    process.exit(1);
  }
}

seed();
