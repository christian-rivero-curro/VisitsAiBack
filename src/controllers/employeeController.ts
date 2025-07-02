import { Request, Response } from 'express';
import { EmployeeService } from '../services/EmployeeService';

const employeeService = new EmployeeService();

export class EmployeeController {
  static async getAllEmployees(req: Request, res: Response) {
    try {
      const employees = await employeeService.getAllEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: 'Error al obtener empleados' });
    }
  }
}
