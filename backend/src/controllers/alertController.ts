import type { Request, Response, NextFunction } from 'express';
import { Alert } from '../models/Alert.js';

export async function getAllAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { tab, resolved, type, cattleId } = req.query;
    const query: Record<string, any> = {};

    if (tab === 'Resolved') {
      query.resolved = true;
    } else if (tab === 'Review') {
      query.resolved = false;
      query.type = 'review';
    } else if (tab === 'Critical') {
      query.resolved = false;
      query.type = 'critical';
    } else if (resolved !== undefined) {
      query.resolved = resolved === 'true';
    }

    if (type && !tab) {
      query.type = type;
    }

    if (cattleId) {
      query.cattleId = cattleId;
    }

    const alerts = await Alert.find(query).sort({ createdAt: -1 });
    const unresolvedCount = await Alert.countDocuments({ resolved: false });

    res.json({
      success: true,
      count: alerts.length,
      unresolvedCount,
      data: alerts,
    });
  } catch (error) {
    next(error);
  }
}

export async function resolveAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { resolvedBy = 'Farmer' } = req.body;

    const alert = await Alert.findByIdAndUpdate(
      id,
      {
        $set: {
          resolved: true,
          resolvedAt: new Date(),
          resolvedBy,
        },
      },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Alert marked as resolved',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
}

export async function createAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { cattleId, cattleName, cattleTagId, type, message, confidence } = req.body;

    const alert = await Alert.create({
      cattleId,
      cattleName,
      cattleTagId,
      type: type || 'review',
      message,
      confidence: confidence || 85,
      resolved: false,
    });

    res.status(201).json({
      success: true,
      message: 'Alert generated successfully',
      data: alert,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const alert = await Alert.findByIdAndDelete(id);

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Alert dismissed and removed',
    });
  } catch (error) {
    next(error);
  }
}
