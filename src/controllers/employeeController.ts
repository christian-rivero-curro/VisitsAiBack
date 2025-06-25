import { Request, Response } from 'express';
import * as employeeService from '../services/employeeService';

export const getEmployees = async (req: Request, res: Response) => {
  try {
    const employees = await employeeService.getAllEmployees();
    res.json(employees);
  } catch (error: any) {
    res.status(500).json({ message: 'Error fetching employees', error: error.message });
  }
};