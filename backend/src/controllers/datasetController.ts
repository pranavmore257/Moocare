import type { Request, Response, NextFunction } from 'express';
import { DatasetSample } from '../models/DatasetSample.js';
import { DatasetImporterService } from '../services/datasetImporterService.js';
import path from 'node:path';
import fs from 'node:fs';

export async function uploadDatasetFile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    const { datasetName = 'User Uploaded Dataset', syncCattle = 'true' } = req.body;

    if (!file) {
      res.status(400).json({
        success: false,
        message: 'No file uploaded. Please upload a .csv or .json dataset file.',
      });
      return;
    }

    const ext = path.extname(file.originalname).toLowerCase();
    const shouldSync = syncCattle === 'true' || syncCattle === true;

    let importResult;

    if (ext === '.csv') {
      importResult = await DatasetImporterService.importCsv(file.path, datasetName, shouldSync);
    } else if (ext === '.json') {
      const rawData = fs.readFileSync(file.path, 'utf8');
      const records = JSON.parse(rawData);
      const recordsArray = Array.isArray(records) ? records : (records.samples || records.data || [records]);
      importResult = await DatasetImporterService.importJson(recordsArray, datasetName, shouldSync);
    } else {
      res.status(400).json({
        success: false,
        message: 'Unsupported format. Supported file formats: .csv, .json',
      });
      return;
    }

    res.status(201).json({
      success: true,
      message: `Successfully ingested dataset: ${datasetName}`,
      summary: importResult,
    });
  } catch (error) {
    next(error);
  }
}

export async function importJsonPayload(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { datasetName = 'API Ingested Dataset', samples, syncCattle = true } = req.body;

    if (!samples || !Array.isArray(samples) || samples.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Invalid payload. "samples" must be a non-empty array of records.',
      });
      return;
    }

    const result = await DatasetImporterService.importJson(samples, datasetName, syncCattle);

    res.status(201).json({
      success: true,
      message: `Successfully imported ${result.inserted} samples from JSON payload.`,
      summary: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function getDatasetStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const totalSamples = await DatasetSample.countDocuments();

    // Group by datasetName
    const datasets = await DatasetSample.aggregate([
      {
        $group: {
          _id: '$datasetName',
          count: { $sum: 1 },
          lastUpdated: { $max: '$updatedAt' },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Group by groundTruthLabel
    const labelBreakdown = await DatasetSample.aggregate([
      {
        $group: {
          _id: '$groundTruthLabel',
          count: { $sum: 1 },
        },
      },
    ]);

    // Group by breed
    const breedBreakdown = await DatasetSample.aggregate([
      {
        $match: { breed: { $exists: true, $ne: '' } },
      },
      {
        $group: {
          _id: '$breed',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Group by vocalizationType
    const vocalizationTypes = await DatasetSample.aggregate([
      {
        $match: { vocalizationType: { $exists: true, $ne: '' } },
      },
      {
        $group: {
          _id: '$vocalizationType',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    res.json({
      success: true,
      data: {
        totalSamples,
        datasets: datasets.map((d) => ({ name: d._id, count: d.count, lastUpdated: d.lastUpdated })),
        labelBreakdown: Object.fromEntries(labelBreakdown.map((l) => [l._id, l.count])),
        breedBreakdown: Object.fromEntries(breedBreakdown.map((b) => [b._id, b.count])),
        vocalizationTypes: Object.fromEntries(vocalizationTypes.map((v) => [v._id, v.count])),
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function getDatasetSamples(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { datasetName, label, search, page = '1', limit = '20' } = req.query;
    const query: Record<string, any> = {};

    if (datasetName) query.datasetName = datasetName;
    if (label) query.groundTruthLabel = label;
    if (search) {
      const reg = new RegExp(String(search), 'i');
      query.$or = [{ sampleId: reg }, { tagId: reg }, { animalName: reg }, { breed: reg }, { vocalizationType: reg }];
    }

    const pageSize = Math.min(100, Math.max(1, Number(limit)));
    const skip = (Math.max(1, Number(page)) - 1) * pageSize;

    const [samples, total] = await Promise.all([
      DatasetSample.find(query).sort({ createdAt: -1 }).skip(skip).limit(pageSize),
      DatasetSample.countDocuments(query),
    ]);

    res.json({
      success: true,
      count: samples.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / pageSize),
      data: samples,
    });
  } catch (error) {
    next(error);
  }
}

export async function clearDataset(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { datasetName } = req.params;
    const result = await DatasetSample.deleteMany({ datasetName });

    res.json({
      success: true,
      message: `Removed ${result.deletedCount} samples belonging to dataset "${datasetName}".`,
    });
  } catch (error) {
    next(error);
  }
}
