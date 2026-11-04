import type { Request, Response, NextFunction } from 'express';
import { Cattle, type HealthStatus } from '../models/Cattle.js';
import { Scan } from '../models/Scan.js';
import { Alert } from '../models/Alert.js';

export async function getAllCattle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status, search, breed, type, sort = 'name' } = req.query;

    const query: Record<string, any> = {};

    if (status && status !== 'All') {
      if (status === 'Critical') {
        query.status = { $in: ['concern', 'critical'] };
      } else if (status === 'Needs Review') {
        query.status = 'review';
      } else if (status === 'Healthy') {
        query.status = 'healthy';
      } else {
        query.status = status;
      }
    }

    if (breed) {
      query.breed = breed;
    }

    if (type) {
      query.type = type;
    }

    if (search) {
      const regex = new RegExp(String(search), 'i');
      query.$or = [{ name: regex }, { tagId: regex }, { breed: regex }];
    }

    const sortOrder: Record<string, 1 | -1> = sort === 'recent' ? { updatedAt: -1 } : { name: 1 };
    const cattle = await Cattle.find(query).sort(sortOrder);

    res.json({
      success: true,
      count: cattle.length,
      data: cattle,
    });
  } catch (error) {
    next(error);
  }
}

export async function getCattleById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    // Support either Mongo ObjectId or tagId lookup
    let cow = null;
    const idStr = Array.isArray(id) ? id[0] : id;
    if (typeof idStr === 'string' && idStr.match(/^[0-9a-fA-F]{24}$/)) {
      cow = await Cattle.findById(idStr);
    }
    if (!cow) {
      cow = await Cattle.findOne({ $or: [{ tagId: idStr }, { tagId: `#${idStr}` }] });
    }

    if (!cow) {
      res.status(404).json({ success: false, message: 'Cattle not found' });
      return;
    }

    // Include recent scans and alerts
    const scans = await Scan.find({ cattleId: cow._id }).sort({ createdAt: -1 }).limit(10);
    const alerts = await Alert.find({ cattleId: cow._id }).sort({ createdAt: -1 }).limit(5);

    res.json({
      success: true,
      data: {
        ...cow.toJSON(),
        scans,
        alerts,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function createCattle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, tagId, breed, age, type, sex, notes, color } = req.body;

    const existing = await Cattle.findOne({ tagId });
    if (existing) {
      res.status(400).json({ success: false, message: `Tag ID ${tagId} is already assigned to ${existing.name}` });
      return;
    }

    const cow = await Cattle.create({
      name,
      tagId,
      breed: breed || 'Holstein Friesian',
      age: Number(age) || 3,
      type: type || 'Dairy',
      sex: sex || 'Female',
      status: 'healthy',
      color: color || '#2E7D5B',
      notes,
      lastChecked: `Added · ${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`,
    });

    res.status(201).json({
      success: true,
      message: 'Cattle registered successfully',
      data: cow,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCattle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const cow = await Cattle.findByIdAndUpdate(id, { $set: req.body }, { new: true, runValidators: true });

    if (!cow) {
      res.status(404).json({ success: false, message: 'Cattle not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Cattle updated successfully',
      data: cow,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCattle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const cow = await Cattle.findByIdAndDelete(id);

    if (!cow) {
      res.status(404).json({ success: false, message: 'Cattle not found' });
      return;
    }

    // Cascade delete scans and alerts
    await Scan.deleteMany({ cattleId: id });
    await Alert.deleteMany({ cattleId: id });

    res.json({
      success: true,
      message: `Cattle ${cow.name} (${cow.tagId}) and associated records deleted.`,
    });
  } catch (error) {
    next(error);
  }
}
