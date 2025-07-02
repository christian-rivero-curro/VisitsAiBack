import { Request, Response } from 'express';
import { VisitCreationService } from '../services/VisitCreationService';
import { VisitCreationPayload } from '../types';

const visitCreationService = new VisitCreationService();

export class VisitCreationController {
  static async createVisit(req: Request<{}, {}, VisitCreationPayload>, res: Response) {
    try {
      const payload = req.body;
      const result = await visitCreationService.createVisit(payload);
      res.status(201).json(result);
    } catch (error) {
      res.status(500).json({ message: 'Error al crear visita' });
    }
  }
}
