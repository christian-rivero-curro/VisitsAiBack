import { Request, Response } from 'express';
import * as statisticsService from '../services/statisticsService';

export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await statisticsService.getStatistics();
    res.json(stats);
  } catch (error: any) {
    console.error('Error in getStats controller:', error);
    
    // Manejar diferentes tipos de errores
    if (error.message?.includes('JSON_SERVER_URL')) {
      return res.status(500).json({ 
        message: 'Server configuration error', 
        error: 'Database connection not configured' 
      });
    }
    
    if (error.message?.includes('Failed to fetch')) {
      return res.status(503).json({ 
        message: 'Service temporarily unavailable', 
        error: 'Unable to connect to database' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error fetching statistics', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};