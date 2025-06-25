import { Request, Response } from 'express';
import * as visitService from '../services/visitService';

export const registerVisit = async (req: Request, res: Response) => {
  try {
    const newVisit = await visitService.createVisit(req.body);
    res.status(201).json({ message: 'Visita registrada correctamente', visitId: newVisit.id });
  } catch (error: any) {
    res.status(500).json({ message: 'Error registering visit', error: error.message });
  }
};

export const findVisits = async (req: Request, res: Response) => {
    try {
        const visits = await visitService.getVisits(req.query);
        res.json(visits);
    } catch (error: any) {
        res.status(500).json({ message: 'Error fetching visits', error: error.message });
    }
};

export const discharge = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { dischargeObservations } = req.body;
        await visitService.dischargeVisitor(Number(id), dischargeObservations);
        res.json({ message: 'Visitant donat de baixa correctament' });
    } catch (error: any) {
        res.status(500).json({ message: 'Error discharging visitor', error: error.message });
    }
};