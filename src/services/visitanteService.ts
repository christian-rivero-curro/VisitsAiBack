import pool from '../database/db';
import { Visitante } from '../types';

export const getAllVisitantes = async (): Promise<Visitante[]> => {
  const query = 'SELECT * FROM visitante ORDER BY nom';
  const result = await pool.query(query);
  return result.rows;
};

export const getVisitanteById = async (id: number): Promise<Visitante | null> => {
  const query = 'SELECT * FROM visitante WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const getVisitanteByDni = async (dni: string): Promise<Visitante | null> => {
  const query = 'SELECT * FROM visitante WHERE dni = $1';
  const result = await pool.query(query, [dni]);
  return result.rows[0] || null;
};

export const createVisitante = async (visitante: Omit<Visitante, 'id'>): Promise<Visitante> => {
  const query = `
    INSERT INTO visitante (dni, nom, empresa, motiu, num_visitants, sexe, observacions, desconegut)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *
  `;
  const result = await pool.query(query, [
    visitante.dni,
    visitante.nom,
    visitante.empresa,
    visitante.motiu,
    visitante.num_visitants,
    visitante.sexe,
    visitante.observacions,
    visitante.desconegut
  ]);
  return result.rows[0];
};

export const updateVisitante = async (id: number, visitante: Partial<Visitante>): Promise<Visitante | null> => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.entries(visitante).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    return getVisitanteById(id);
  }

  values.push(id);
  const query = `UPDATE visitante SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteVisitante = async (id: number): Promise<boolean> => {
  const query = 'DELETE FROM visitante WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};