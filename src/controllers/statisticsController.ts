import { Request, Response } from 'express';
import * as statisticsService from '../services/statisticsService';

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await statisticsService.getStatistics();
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching statistics', error: error.message });
  }
};