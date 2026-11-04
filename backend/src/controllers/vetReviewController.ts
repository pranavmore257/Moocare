import type { Request, Response, NextFunction } from 'express';
import { VetReview } from '../models/VetReview.js';
import { Cattle } from '../models/Cattle.js';

export async function getAllVetReviews(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.query;
    const query: Record<string, any> = {};
    if (status) query.status = status;

    const reviews = await VetReview.find(query).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    next(error);
  }
}

export async function createVetReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { cattleId, scanId, farmerMessage, priority = 'normal' } = req.body;

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

    const review = await VetReview.create({
      cattleId: cow._id,
      cattleName: cow.name,
      cattleTagId: cow.tagId,
      scanId,
      farmerMessage: farmerMessage || 'Please review this cattle vocalization and associated health record.',
      priority,
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Vet review request submitted successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateVetReview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    const { status, vetFeedback, assignedVet } = req.body;

    const review = await VetReview.findByIdAndUpdate(
      id,
      {
        $set: {
          ...(status ? { status } : {}),
          ...(vetFeedback ? { vetFeedback, reviewedAt: new Date() } : {}),
          ...(assignedVet ? { assignedVet } : {}),
        },
      },
      { new: true }
    );

    if (!review) {
      res.status(404).json({ success: false, message: 'Vet review not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Vet review updated successfully',
      data: review,
    });
  } catch (error) {
    next(error);
  }
}
