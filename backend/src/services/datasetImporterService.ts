import fs from 'node:fs';
import csvParser from 'csv-parser';
import { DatasetSample, type IDatasetSample } from '../models/DatasetSample.js';
import { Cattle, type HealthStatus } from '../models/Cattle.js';

export interface ImportResult {
  datasetName: string;
  totalProcessed: number;
  inserted: number;
  errors: number;
  skipped: number;
  cattleCreated: number;
  labelBreakdown: Record<string, number>;
  samplePreview: any[];
}

export class DatasetImporterService {
  /**
   * Import dataset from a CSV file
   */
  public static async importCsv(
    filePath: string,
    datasetName = 'Imported Bioacoustic Dataset',
    syncCattle = true
  ): Promise<ImportResult> {
    return new Promise((resolve, reject) => {
      const rows: any[] = [];

      fs.createReadStream(filePath)
        .pipe(csvParser())
        .on('data', (data) => rows.push(data))
        .on('end', async () => {
          try {
            const result = await this.processRecords(rows, datasetName, syncCattle);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        })
        .on('error', (err) => reject(err));
    });
  }

  /**
   * Import dataset from a JSON array
   */
  public static async importJson(
    records: any[],
    datasetName = 'Imported Bioacoustic Dataset',
    syncCattle = true
  ): Promise<ImportResult> {
    return this.processRecords(records, datasetName, syncCattle);
  }

  /**
   * Process and normalize raw records into MongoDB DatasetSample and Cattle collections
   */
  private static async processRecords(
    records: any[],
    datasetName: string,
    syncCattle: boolean
  ): Promise<ImportResult> {
    let inserted = 0;
    let skipped = 0;
    let errors = 0;
    let cattleCreated = 0;
    const labelBreakdown: Record<string, number> = {};
    const samplePreview: any[] = [];

    // Distinct cattle tags map to avoid redundant queries
    const discoveredCattle = new Map<string, any>();

    for (let i = 0; i < records.length; i++) {
      const raw = records[i];
      try {
        // Smart column mapping (case-insensitive & flexible header names)
        const sampleId = String(
          raw.sampleId || raw.sample_id || raw.id || raw.ID || `sample_${Date.now()}_${i + 1}`
        ).trim();

        const tagId = String(
          raw.tagId || raw.tag_id || raw.tag || raw.Tag || raw.animal_id || raw.animalId || `#${100 + i}`
        ).trim();

        const animalName = (
          raw.animalName || raw.animal_name || raw.name || raw.Name || `Cattle ${tagId}`
        ).trim();

        const breed = (raw.breed || raw.Breed || 'Holstein Friesian').trim();
        const age = Number(raw.age || raw.Age || 3);
        const vocalizationType = (
          raw.vocalizationType || raw.vocalization_type || raw.vocal_type || raw.call_type || 'General Vocalization'
        ).trim();

        // Normalize label: healthy, review, concern, critical, distress, stress
        const rawLabel = String(
          raw.label || raw.groundTruthLabel || raw.ground_truth || raw.status || raw.health_status || 'healthy'
        ).toLowerCase().trim();

        let normalizedStatus: HealthStatus = 'healthy';
        if (rawLabel.includes('crit') || rawLabel.includes('severe')) {
          normalizedStatus = 'critical';
        } else if (rawLabel.includes('concern') || rawLabel.includes('distress') || rawLabel.includes('pain') || rawLabel.includes('sick')) {
          normalizedStatus = 'concern';
        } else if (rawLabel.includes('review') || rawLabel.includes('stress') || rawLabel.includes('mild')) {
          normalizedStatus = 'review';
        } else {
          normalizedStatus = 'healthy';
        }

        labelBreakdown[normalizedStatus] = (labelBreakdown[normalizedStatus] || 0) + 1;

        const duration = Number(raw.duration || raw.duration_seconds || raw.audio_duration || 5.5);
        const confidence = Number(raw.confidence || 88);

        // Acoustic features parsing
        const meanPitchHz = Number(raw.pitch || raw.mean_pitch || raw.f0 || raw.fundamental_frequency || 180);
        const peakFrequencyHz = Number(raw.peak_frequency || raw.peak_freq || meanPitchHz * 2.1);
        const hnr = Number(raw.hnr || raw.harmonic_to_noise || 18.5);
        const jitter = Number(raw.jitter || raw.jitter_pct || 1.8);
        const shimmer = Number(raw.shimmer || raw.shimmer_pct || 3.5);
        const decibels = Number(raw.decibels || raw.db || raw.volume || 72);

        // Build dataset sample document
        const sampleDoc = {
          datasetName,
          sampleId,
          tagId,
          animalName,
          breed,
          age,
          vocalizationType,
          groundTruthLabel: normalizedStatus,
          predictedLabel: normalizedStatus,
          confidence,
          audioDurationSec: duration,
          audioFileName: raw.audioFileName || raw.audio_file || raw.filename || undefined,
          acousticFeatures: {
            fundamentalFrequencyHz: isNaN(meanPitchHz) ? undefined : meanPitchHz,
            peakFrequencyHz: isNaN(peakFrequencyHz) ? undefined : peakFrequencyHz,
            harmonicsToNoiseRatio: isNaN(hnr) ? undefined : hnr,
            jitterPct: isNaN(jitter) ? undefined : jitter,
            shimmerPct: isNaN(shimmer) ? undefined : shimmer,
            decibels: isNaN(decibels) ? undefined : decibels,
          },
          context: raw.notes || raw.context || raw.description || undefined,
          metadata: raw,
        };

        // Upsert into DatasetSample
        await DatasetSample.findOneAndUpdate(
          { datasetName, sampleId },
          { $set: sampleDoc },
          { upsert: true, new: true }
        );
        inserted++;

        if (samplePreview.length < 5) {
          samplePreview.push(sampleDoc);
        }

        // Cache cattle for auto-creation
        if (syncCattle && tagId) {
          discoveredCattle.set(tagId, {
            name: animalName,
            tagId,
            breed,
            age,
            type: raw.type || 'Dairy',
            sex: raw.sex || 'Female',
            status: normalizedStatus,
            color: raw.color || '#2E7D5B',
          });
        }
      } catch (err) {
        console.error(`Error processing dataset row ${i}:`, err);
        errors++;
      }
    }

    // Auto-sync discovered unique cattle into the Cattle collection
    if (syncCattle && discoveredCattle.size > 0) {
      for (const [tagId, cattleInfo] of discoveredCattle.entries()) {
        const existing = await Cattle.findOne({ tagId });
        if (!existing) {
          await Cattle.create({
            name: cattleInfo.name,
            tagId: cattleInfo.tagId,
            breed: cattleInfo.breed,
            age: cattleInfo.age,
            type: cattleInfo.type,
            sex: cattleInfo.sex,
            status: cattleInfo.status,
            color: cattleInfo.color,
            lastChecked: `Imported · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
          });
          cattleCreated++;
        }
      }
    }

    return {
      datasetName,
      totalProcessed: records.length,
      inserted,
      errors,
      skipped,
      cattleCreated,
      labelBreakdown,
      samplePreview,
    };
  }
}
