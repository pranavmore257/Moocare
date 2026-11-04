import type { Request, Response, NextFunction } from 'express';
import { Scan } from '../models/Scan.js';
import { Cattle, type HealthStatus } from '../models/Cattle.js';
import { Alert } from '../models/Alert.js';
import { AudioAnalysisService } from '../services/audioAnalysisService.js';

export async function getAllScans(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { cattleId, status, limit = '20', page = '1' } = req.query;
    const query: Record<string, any> = {};

    if (cattleId) {
      // Find cattle by id or tagId
      const cow = await Cattle.findOne({
        $or: [
          ...(String(cattleId).match(/^[0-9a-fA-F]{24}$/) ? [{ _id: cattleId }] : []),
          { tagId: cattleId },
          { tagId: `#${cattleId}` },
        ],
      });
      if (cow) {
        query.cattleId = cow._id;
      } else {
        query.cattleId = cattleId;
      }
    }

    if (status) {
      query.status = status;
    }

    const pageSize = Math.min(100, Math.max(1, Number(limit)));
    const skip = (Math.max(1, Number(page)) - 1) * pageSize;

    const [scans, total] = await Promise.all([
      Scan.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      Scan.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: scans.length,
      total,
      page: Number(page),
      data: scans,
    });
  } catch (error) {
    next(error);
  }
}

export async function getScanById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const scan = await Scan.findById(id).populate('cattleId', 'name tagId breed age color status');

    if (!scan) {
      res.status(404).json({ success: false, message: 'Scan record not found' });
      return;
    }

    res.json({
      success: true,
      data: scan,
    });
  } catch (error) {
    next(error);
  }
}

export async function createScan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      cattleId,
      duration = 5.8,
      features,
      manualStatus,
      manualConfidence,
    } = req.body;

    // Find cattle
    let cow = null;
    if (String(cattleId).match(/^[0-9a-fA-F]{24}$/)) {
      cow = await Cattle.findById(cattleId);
    }
    if (!cow) {
      cow = await Cattle.findOne({ $or: [{ tagId: cattleId }, { tagId: `#${cattleId}` }] });
    }

    if (!cow) {
      res.status(404).json({ success: false, message: 'Target cattle not found' });
      return;
    }

    // Run bioacoustic analysis
    const analysis = AudioAnalysisService.analyze({
      duration: Number(duration),
      features,
      breed: cow.breed,
      age: cow.age,
    });

    const finalStatus: HealthStatus = manualStatus || analysis.status;
    const finalConfidence = manualConfidence !== undefined ? Number(manualConfidence) : analysis.confidence;

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = `Today · ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const scan = await Scan.create({
      cattleId: cow._id,
      cattleName: cow.name,
      cattleTagId: cow.tagId,
      date: formattedDate,
      timestamp: formattedTime,
      status: finalStatus,
      confidence: finalConfidence,
      duration: analysis.duration,
      breakdown: analysis.breakdown,
      waveformData: analysis.waveformData,
      acousticFeatures: analysis.acousticFeatures,
      aiInsights: analysis.aiInsights,
      vetReviewed: false,
    });

    // Update Cattle status & lastChecked
    cow.status = finalStatus;
    cow.lastChecked = formattedTime;
    await cow.save();

    // Auto-create alert if status requires review, concern, or critical
    let alertCreated = null;
    if (finalStatus === 'critical' || finalStatus === 'concern') {
      alertCreated = await Alert.create({
        cattleId: cow._id,
        cattleName: cow.name,
        cattleTagId: cow.tagId,
        scanId: scan._id,
        type: 'critical',
        message:
          finalStatus === 'critical'
            ? `Critical abnormal vocalization detected in ${cow.name} (${cow.tagId}). Immediate attention needed.`
            : `Elevated acoustic distress indicators detected in ${cow.name} (${cow.tagId}).`,
        timestamp: formattedTime,
        confidence: finalConfidence,
        resolved: false,
      });
    } else if (finalStatus === 'review') {
      alertCreated = await Alert.create({
        cattleId: cow._id,
        cattleName: cow.name,
        cattleTagId: cow.tagId,
        scanId: scan._id,
        type: 'review',
        message: `Low confidence result for ${cow.name} (${cow.tagId}) — re-check recommended.`,
        timestamp: formattedTime,
        confidence: finalConfidence,
        resolved: false,
      });
    }

    res.status(201).json({
      success: true,
      message: 'Acoustic vocalization scan processed successfully',
      data: {
        scan,
        cattle: cow,
        alert: alertCreated,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function uploadAndAnalyzeAudio(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    const { cattleId, duration } = req.body;

    if (!file) {
      res.status(400).json({ success: false, message: 'Audio file is required (WAV, MP3, M4A, OGG)' });
      return;
    }

    // Find cattle
    let cow = null;
    if (String(cattleId).match(/^[0-9a-fA-F]{24}$/)) {
      cow = await Cattle.findById(cattleId);
    }
    if (!cow) {
      cow = await Cattle.findOne({ $or: [{ tagId: cattleId }, { tagId: `#${cattleId}` }] });
    }

    if (!cow) {
      res.status(404).json({ success: false, message: 'Target cattle not found' });
      return;
    }

    const audioUrl = `/uploads/audio/${file.filename}`;

    const analysis = AudioAnalysisService.analyze({
      filePath: file.path,
      duration: duration ? Number(duration) : 5.8,
      breed: cow.breed,
      age: cow.age,
    });

    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const formattedTime = `Today · ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

    const scan = await Scan.create({
      cattleId: cow._id,
      cattleName: cow.name,
      cattleTagId: cow.tagId,
      date: formattedDate,
      timestamp: formattedTime,
      status: analysis.status,
      confidence: analysis.confidence,
      duration: analysis.duration,
      breakdown: analysis.breakdown,
      audioUrl,
      waveformData: analysis.waveformData,
      acousticFeatures: analysis.acousticFeatures,
      aiInsights: analysis.aiInsights,
      vetReviewed: false,
    });

    cow.status = analysis.status;
    cow.lastChecked = formattedTime;
    await cow.save();

    res.status(201).json({
      success: true,
      message: 'Audio vocalization analyzed and saved',
      data: {
        scan,
        cattle: cow,
      },
    });
  } catch (error) {
    next(error);
  }
}
