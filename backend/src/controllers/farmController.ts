import type { Request, Response, NextFunction } from 'express';
import { FarmProfile } from '../models/FarmProfile.js';
import { Cattle } from '../models/Cattle.js';
import { Alert } from '../models/Alert.js';
import { Scan } from '../models/Scan.js';

export async function getFarmProfile(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let profile = await FarmProfile.findOne();
    if (!profile) {
      profile = await FarmProfile.create({
        farmName: 'Sharma Dairy Farm',
        ownerName: 'Arjun Sharma',
        location: 'Anand, Gujarat',
        email: 'arjun.sharma@sharmadairy.in',
        phone: '+91 98765 43210',
        totalCapacity: 50,
      });
    }

    res.json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateFarmProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let profile = await FarmProfile.findOne();
    if (!profile) {
      profile = await FarmProfile.create(req.body);
    } else {
      profile = await FarmProfile.findByIdAndUpdate(profile._id, { $set: req.body }, { new: true });
    }

    res.json({
      success: true,
      message: 'Farm profile updated successfully',
      data: profile,
    });
  } catch (error) {
    next(error);
  }
}

export async function getHerdDashboardStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const [totalCattle, healthyCount, reviewCount, concernCount, unresolvedAlerts, recentScans] =
      await Promise.all([
        Cattle.countDocuments(),
        Cattle.countDocuments({ status: 'healthy' }),
        Cattle.countDocuments({ status: 'review' }),
        Cattle.countDocuments({ status: { $in: ['concern', 'critical'] } }),
        Alert.countDocuments({ resolved: false }),
        Scan.find().sort({ createdAt: -1 }).limit(4),
      ]);

    res.json({
      success: true,
      data: {
        totalCattle,
        healthyCount,
        reviewCount,
        concernCount,
        unresolvedAlerts,
        recentScans,
      },
    });
  } catch (error) {
    next(error);
  }
}
