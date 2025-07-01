import pool from '../database/db';
import { Treballador } from '../types';

export const getAllTreballadors = async (): Promise<Treballador[]> => {
  const query = `
    SELECT t.*, d.nom as delegacio_nom 
    FROM treballador t 
    LEFT JOIN delegacio d ON t.delegacio_id = d.id 
    ORDER BY t.primer_cognom, t.segon_cognom
  `;
  const result = await pool.query(query);
  return result.rows;
};

export const getTreballadorById = async (id: number): Promise<Treballador | null> => {
  const query = `
    SELECT t.*, d.nom as delegacio_nom 
    FROM treballador t 
    LEFT JOIN delegacio d ON t.delegacio_id = d.id 
    WHERE t.id = $1
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const getTreballadorByDni = async (dni: string): Promise<Treballador | null> => {
  const query = `
    SELECT t.*, d.nom as delegacio_nom 
    FROM treballador t 
    LEFT JOIN delegacio d ON t.delegacio_id = d.id 
    WHERE t.dni = $1
  `;
  const result = await pool.query(query, [dni]);
  return result.rows[0] || null;
};

export const createTreballador = async (treballador: Omit<Treballador, 'id'>): Promise<Treballador> => {
  const query = `
    INSERT INTO treballador (
      dni, nom_complet, primer_cognom, segon_cognom, numero, codi_servei,
      destacat1, destacat2, tipus_registre, usuari, capcalera, extern,
      direccio_general, unitat_organica, servei, ubicacio, rol, ordre_recepcio, delegacio_id
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
    RETURNING *
  `;
  const result = await pool.query(query, [
    treballador.dni,
    treballador.nom_complet,
    treballador.primer_cognom,
    treballador.segon_cognom,
    treballador.numero,
    treballador.codi_servei,
    treballador.destacat1,
    treballador.destacat2,
    treballador.tipus_registre,
    treballador.usuari,
    treballador.capcalera,
    treballador.extern,
    treballador.direccio_general,
    treballador.unitat_organica,
    treballador.servei,
    treballador.ubicacio,
    treballador.rol,
    treballador.ordre_recepcio,
    treballador.delegacio_id
  ]);
  return result.rows[0];
};

export const updateTreballador = async (id: number, treballador: Partial<Treballador>): Promise<Treballador | null> => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.entries(treballador).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    return getTreballadorById(id);
  }

  values.push(id);
  const query = `UPDATE treballador SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteTreballador = async (id: number): Promise<boolean> => {
  const query = 'DELETE FROM treballador WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};