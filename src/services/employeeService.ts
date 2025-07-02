import { Employee } from '../types';
import pool from '../database/db';

export class EmployeeService {
  // Obtener todos los empleados desde PostgreSQL
  async getAllEmployees(): Promise<Employee[]> {
    try {
      const query = `
        SELECT
          id,
          nom_complet,
          primer_cognom,
          segon_cognom,
          direccio_general,
          unitat_organica,
          servei,
          ubicacio,
          numero
        FROM treballador
      `;

      const result = await pool.query(query);

      const employees: Employee[] = result.rows.map((row) => ({
        id: row.id,
        name: row.nom_complet || `${row.primer_cognom} ${row.segon_cognom ?? ''}`.trim(),
        dg: row.direccio_general || '',
        orgUnit: row.unitat_organica || '',
        service: row.servei || '',
        location: row.ubicacio || '',
        phone: row.numero || '',
      }));

      return employees;
    } catch (error) {
      console.error('Error al obtener empleados:', error);
      throw error;
    }
  }
}
