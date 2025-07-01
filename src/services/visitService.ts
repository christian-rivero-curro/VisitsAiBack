import pool from '../database/db';
import { VisitRegistrationPayload } from '../types';
import * as visitanteService from './visitanteService';
import * as treballadorService from './treballadorService';

export const createVisit = async (payload: VisitRegistrationPayload) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { visitor, visitDetails, visit } = payload;
    
    // 1. Verificar si el trabajador existe
    const treballador = await treballadorService.getTreballadorById(visit.employeeId);
    if (!treballador) {
      throw new Error(`Employee with id ${visit.employeeId} not found`);
    }
    
    // 2. Buscar o crear visitante
    let visitante = await visitanteService.getVisitanteByDni(visitor.dni);
    if (!visitante) {
      visitante = await visitanteService.createVisitante({
        dni: visitor.dni,
        nom: visitor.name,
        empresa: visitor.company,
        motiu: visitDetails.reason,
        num_visitants: visitDetails.visitors || 1,
        sexe: null,
        observacions: visitDetails.observations,
        desconegut: false
      });
    }
    
    // 3. Crear la visita
    const now = new Date();
    const visitaData = {
      visitante_id: visitante.id,
      treballador_id: visit.employeeId,
      delegacio_id: treballador.delegacio_id || 1, // Delegación por defecto
      data_visita: now.toISOString().split('T')[0],
      hora_ini: now.toTimeString().split(' ')[0],
      hora_fi: null,
      tarjeta_id: visitDetails.cardNumber,
      pendent: true,
      observacions: visitDetails.observations
    };
    
    const query = `
      INSERT INTO visita (visitante_id, treballador_id, delegacio_id, data_visita, hora_ini, hora_fi, tarjeta_id, pendent, observacions)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;
    
    const result = await client.query(query, [
      visitaData.visitante_id,
      visitaData.treballador_id,
      visitaData.delegacio_id,
      visitaData.data_visita,
      visitaData.hora_ini,
      visitaData.hora_fi,
      visitaData.tarjeta_id,
      visitaData.pendent,
      visitaData.observacions
    ]);
    
    await client.query('COMMIT');
    
    return {
      id: result.rows[0].id,
      ...visitaData,
      visitante,
      treballador
    };
    
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const getVisits = async (filters: any) => {
  try {
    let query = `
      SELECT 
        v.*,
        vt.dni as visitante_dni,
        vt.nom as visitante_nom,
        vt.empresa as visitante_empresa,
        t.nom_complet as treballador_nom,
        t.primer_cognom as treballador_cognom,
        t.servei as treballador_servei,
        t.unitat_organica as treballador_unitat,
        d.nom as delegacio_nom
      FROM visita v
      JOIN visitante vt ON v.visitante_id = vt.id
      JOIN treballador t ON v.treballador_id = t.id
      JOIN delegacio d ON v.delegacio_id = d.id
    `;

    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (filters.startDate) {
      conditions.push(`v.data_visita >= $${paramCount++}`);
      values.push(filters.startDate);
    }

    if (filters.endDate) {
      conditions.push(`v.data_visita <= $${paramCount++}`);
      values.push(filters.endDate);
    }

    if (filters.status) {
      if (filters.status === 'active') {
        conditions.push('v.pendent = true');
      } else if (filters.status === 'completed') {
        conditions.push('v.pendent = false');
      }
    }

    if (filters.name_like) {
      conditions.push(`vt.nom ILIKE $${paramCount++}`);
      values.push(`%${filters.name_like}%`);
    }

    if (filters.dni_like) {
      conditions.push(`vt.dni ILIKE $${paramCount++}`);
      values.push(`%${filters.dni_like}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY v.data_visita DESC, v.hora_ini DESC';

    const result = await pool.query(query, values);
    
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
        orgUnit: row.treballador_unitat || '',
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
  } catch (error) {
    console.error('Error in getVisits:', error);
    throw new Error('Failed to fetch visits from database');
  }
};

export const dischargeVisitor = async (id: number, observations: string) => {
  try {
    const now = new Date();
    const query = `
      UPDATE visita 
      SET hora_fi = $1, pendent = false, observacions = COALESCE(observacions || ' | ', '') || $2
      WHERE id = $3
      RETURNING *
    `;
    
    const result = await pool.query(query, [
      now.toTimeString().split(' ')[0],
      observations,
      id
    ]);
    
    if (result.rowCount === 0) {
      throw new Error('Visit not found');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Error in dischargeVisitor:', error);
    throw new Error('Failed to discharge visitor');
  }
};