import { Router } from 'express';
import { EmployeeController } from '../controllers/EmployeeController';
import { VisitVisitorController } from '../controllers/VisitVisitorController';
import { VisitCreationController } from '../controllers/VisitCreationController';

const router = Router();

// Empleados
router.get('/employees', EmployeeController.getAllEmployees);

// Visitas
router.get('/visits', VisitVisitorController.getAllVisits);
router.get('/visitas', VisitVisitorController.getAllVisits);
router.patch('/visits/:id', VisitVisitorController.updateVisit);
router.patch('/visitas/:id', VisitVisitorController.updateVisit);

// Crear visita
router.post('/visits', VisitCreationController.createVisit);

export default router;
