import { Request, Response } from 'express';
import * as visitService from '../services/visitService';

export const registerVisit = async (req: Request, res: Response) => {
  try {
    // Validación básica del payload
    const { visitor, visitDetails, visit } = req.body;
    
    if (!visitor || !visitDetails || !visit) {
      return res.status(400).json({ 
        message: 'Invalid request data', 
        error: 'Missing required fields: visitor, visitDetails, or visit' 
      });
    }
    
    if (!visitor.dni || !visitor.name) {
      return res.status(400).json({ 
        message: 'Invalid visitor data', 
        error: 'DNI and name are required' 
      });
    }
    
    if (!visit.employeeId) {
      return res.status(400).json({ 
        message: 'Invalid visit data', 
        error: 'Employee ID is required' 
      });
    }

    const newVisit = await visitService.createVisit(req.body);
    res.status(201).json({ 
      message: 'Visita registrada correctamente', 
      visitId: newVisit.id,
      visit: newVisit
    });
  } catch (error: any) {
    console.error('Error in registerVisit controller:', error);
    
    if (error.message?.includes('JSON_SERVER_URL')) {
      return res.status(500).json({ 
        message: 'Server configuration error', 
        error: 'Database connection not configured' 
      });
    }
    
    if (error.message?.includes('Employee with id') && error.message?.includes('not found')) {
      return res.status(404).json({ 
        message: 'Employee not found', 
        error: 'The specified employee does not exist' 
      });
    }
    
    if (error.message?.includes('Failed to create')) {
      return res.status(503).json({ 
        message: 'Service temporarily unavailable', 
        error: 'Unable to save visit to database' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error registering visit', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};

export const findVisits = async (req: Request, res: Response) => {
  try {
    // Validar parámetros de consulta si es necesario
    const { startDate, endDate } = req.query;
    
    // Validación de fechas si se proporcionan
    if (startDate && isNaN(Date.parse(startDate as string))) {
      return res.status(400).json({ 
        message: 'Invalid date format', 
        error: 'startDate must be a valid date' 
      });
    }
    
    if (endDate && isNaN(Date.parse(endDate as string))) {
      return res.status(400).json({ 
        message: 'Invalid date format', 
        error: 'endDate must be a valid date' 
      });
    }
    
    // Validar que startDate no sea posterior a endDate
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      if (start > end) {
        return res.status(400).json({ 
          message: 'Invalid date range', 
          error: 'startDate cannot be after endDate' 
        });
      }
    }

    const visits = await visitService.getVisits(req.query);
    res.json(visits);
  } catch (error: any) {
    console.error('Error in findVisits controller:', error);
    
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
      message: 'Error fetching visits', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};

export const discharge = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { dischargeObservations } = req.body;
    
    // Validar que el ID sea un número válido
    const visitId = parseInt(id);
    if (isNaN(visitId) || visitId <= 0) {
      return res.status(400).json({ 
        message: 'Invalid visit ID', 
        error: 'Visit ID must be a positive number' 
      });
    }
    
    // Las observaciones pueden ser opcionales, pero si se proporcionan deben ser string
    if (dischargeObservations && typeof dischargeObservations !== 'string') {
      return res.status(400).json({ 
        message: 'Invalid discharge observations', 
        error: 'Discharge observations must be a string' 
      });
    }

    await visitService.dischargeVisitor(visitId, dischargeObservations || '');
    res.json({ message: 'Visitant donat de baixa correctament' });
  } catch (error: any) {
    console.error('Error in discharge controller:', error);
    
    if (error.message?.includes('JSON_SERVER_URL')) {
      return res.status(500).json({ 
        message: 'Server configuration error', 
        error: 'Database connection not configured' 
      });
    }
    
    if (error.message?.includes('Failed to fetch visit for update')) {
      return res.status(404).json({ 
        message: 'Visit not found', 
        error: 'The specified visit does not exist' 
      });
    }
    
    if (error.message?.includes('Failed to update')) {
      return res.status(503).json({ 
        message: 'Service temporarily unavailable', 
        error: 'Unable to update visit in database' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error discharging visitor', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};