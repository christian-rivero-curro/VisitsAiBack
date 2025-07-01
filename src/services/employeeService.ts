import pool from '../database/db';
import { Employee } from '../types';

export const getAllEmployees = async (): Promise<Employee[]> => {
  try {
    const query = `
      SELECT 
        t.id,
        COALESCE(t.nom_complet, CONCAT(t.primer_cognom, ' ', t.segon_cognom)) as name,
        COALESCE(t.direccio_general, '') as dg,
        COALESCE(t.unitat_organica, '') as orgUnit,
        COALESCE(t.servei, '') as service,
        COALESCE(t.ubicacio, d.nom, '') as location,
        COALESCE(t.numero, '') as phone
      FROM treballador t
      LEFT JOIN delegacio d ON t.delegacio_id = d.id
      ORDER BY t.primer_cognom, t.segon_cognom
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error in getAllEmployees:', error);
    throw new Error('Failed to fetch employees from database');
  }
};

export const getEmployeeById = async (id: number): Promise<Employee | null> => {
  try {
    const query = `
      SELECT 
        t.id,
        COALESCE(t.nom_complet, CONCAT(t.primer_cognom, ' ', t.segon_cognom)) as name,
        COALESCE(t.direccio_general, '') as dg,
        COALESCE(t.unitat_organica, '') as orgUnit,
        COALESCE(t.servei, '') as service,
        COALESCE(t.ubicacio, d.nom, '') as location,
        COALESCE(t.numero, '') as phone
      FROM treballador t
      LEFT JOIN delegacio d ON t.delegacio_id = d.id
      WHERE t.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    throw new Error('Failed to fetch employee from database');
  }
};