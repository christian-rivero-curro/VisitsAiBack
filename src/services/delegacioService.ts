import pool from '../database/db';
import { Delegacio } from '../types';

export const getAllDelegacions = async (): Promise<Delegacio[]> => {
  const query = 'SELECT * FROM delegacio ORDER BY nom';
  const result = await pool.query(query);
  return result.rows;
};

export const getDelegacioById = async (id: number): Promise<Delegacio | null> => {
  const query = 'SELECT * FROM delegacio WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const createDelegacio = async (delegacio: Omit<Delegacio, 'id'>): Promise<Delegacio> => {
  const query = `
    INSERT INTO delegacio (nom, adreca, utilitza_tarjeta)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const result = await pool.query(query, [
    delegacio.nom,
    delegacio.adreca,
    delegacio.utilitza_tarjeta
  ]);
  return result.rows[0];
};

export const updateDelegacio = async (id: number, delegacio: Partial<Delegacio>): Promise<Delegacio | null> => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  if (delegacio.nom !== undefined) {
    fields.push(`nom = $${paramCount++}`);
    values.push(delegacio.nom);
  }
  if (delegacio.adreca !== undefined) {
    fields.push(`adreca = $${paramCount++}`);
    values.push(delegacio.adreca);
  }
  if (delegacio.utilitza_tarjeta !== undefined) {
    fields.push(`utilitza_tarjeta = $${paramCount++}`);
    values.push(delegacio.utilitza_tarjeta);
  }

  if (fields.length === 0) {
    return getDelegacioById(id);
  }

  values.push(id);
  const query = `UPDATE delegacio SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteDelegacio = async (id: number): Promise<boolean> => {
  const query = 'DELETE FROM delegacio WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};