import { Request, Response } from 'express';
import { VisitVisitorService } from '../services/VisitVisitorService';
import { VisitUpdatePayload, VisitFilters } from '../types';

const visitVisitorService = new VisitVisitorService();

export class VisitVisitorController {
  static async getAllVisits(req: Request<{}, {}, {}, VisitFilters>, res: Response) {
    try {
      const filters = req.query;
      const visits = await visitVisitorService.getAllVisits(filters);
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener visitas' });
    }
  }

  static async updateVisit(req: Request<{ id: string }, {}, VisitUpdatePayload>, res: Response) {
    try {
      const id = Number(req.params.id);
      const payload = req.body;
      await visitVisitorService.updateVisit(id, payload);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: 'Error al actualizar visita' });
    }
  }
}
