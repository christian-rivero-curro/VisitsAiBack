import pool from '../database/db';
import { Visita } from '../types';

export const getAllVisitas = async (filters?: any): Promise<any[]> => {
  let query = `
    SELECT 
      v.*,
      vt.dni as visitante_dni,
      vt.nom as visitante_nom,
      vt.empresa as visitante_empresa,
      t.nom_complet as treballador_nom,
      t.primer_cognom as treballador_cognom,
      t.servei as treballador_servei,
      d.nom as delegacio_nom
    FROM visita v
    JOIN visitante vt ON v.visitante_id = vt.id
    JOIN treballador t ON v.treballador_id = t.id
    JOIN delegacio d ON v.delegacio_id = d.id
  `;

  const conditions = [];
  const values = [];
  let paramCount = 1;

  if (filters?.startDate) {
    conditions.push(`v.data_visita >= $${paramCount++}`);
    values.push(filters.startDate);
  }

  if (filters?.endDate) {
    conditions.push(`v.data_visita <= $${paramCount++}`);
    values.push(filters.endDate);
  }

  if (filters?.status) {
    if (filters.status === 'active') {
      conditions.push('v.pendent = true');
    } else if (filters.status === 'completed') {
      conditions.push('v.pendent = false');
    }
  }

  if (filters?.name_like) {
    conditions.push(`vt.nom ILIKE $${paramCount++}`);
    values.push(`%${filters.name_like}%`);
  }

  if (filters?.dni_like) {
    conditions.push(`vt.dni ILIKE $${paramCount++}`);
    values.push(`%${filters.dni_like}%`);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY v.data_visita DESC, v.hora_ini DESC';

  const result = await pool.query(query, values);
  
  // Transformar para compatibilidad con frontend
  return result.rows.map(row => ({
    id: row.id,
    visitor: {
      dni: row.visitante_dni,
      name: row.visitante_nom,
      company: row.visitante_empresa,
      reason: row.observacions,
      cardNumber: row.tarjeta_id,
      visitors: 1,
      color: '',
      observations: row.observacions,
      date: row.data_visita,
      hourIni: row.hora_ini,
      hourFi: row.hora_fi
    },
    visit: {
      name: row.treballador_nom || `${row.treballador_cognom}`,
      dg: '',
      orgUnit: row.treballador_servei || '',
      service: row.treballador_servei || '',
      location: row.delegacio_nom,
      phone: ''
    },
    visitDetails: {
      reason: row.observacions,
      cardNumber: row.tarjeta_id,
      visitors: 1,
      color: '',
      observations: row.observacions,
      date: row.data_visita,
      hourIni: row.hora_ini,
      hourFi: row.hora_fi
    },
    status: row.pendent ? 'active' : 'completed',
    createdAt: new Date(row.data_visita + ' ' + row.hora_ini).toISOString()
  }));
};

export const getVisitaById = async (id: number): Promise<Visita | null> => {
  const query = 'SELECT * FROM visita WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
};

export const createVisita = async (visita: Omit<Visita, 'id'>): Promise<Visita> => {
  const query = `
    INSERT INTO visita (visitante_id, treballador_id, delegacio_id, data_visita, hora_ini, hora_fi, tarjeta_id, pendent, observacions)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;
  const result = await pool.query(query, [
    visita.visitante_id,
    visita.treballador_id,
    visita.delegacio_id,
    visita.data_visita,
    visita.hora_ini,
    visita.hora_fi,
    visita.tarjeta_id,
    visita.pendent,
    visita.observacions
  ]);
  return result.rows[0];
};

export const updateVisita = async (id: number, visita: Partial<Visita>): Promise<Visita | null> => {
  const fields = [];
  const values = [];
  let paramCount = 1;

  Object.entries(visita).forEach(([key, value]) => {
    if (value !== undefined && key !== 'id') {
      fields.push(`${key} = $${paramCount++}`);
      values.push(value);
    }
  });

  if (fields.length === 0) {
    return getVisitaById(id);
  }

  values.push(id);
  const query = `UPDATE visita SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
  const result = await pool.query(query, values);
  return result.rows[0] || null;
};

export const deleteVisita = async (id: number): Promise<boolean> => {
  const query = 'DELETE FROM visita WHERE id = $1';
  const result = await pool.query(query, [id]);
  return result.rowCount > 0;
};