import { VisitCreationPayload, VisitCreationResponse, VisitUpdatePayload } from '../types';
import pool from '../database/db';

export class VisitCreationService {
  async createVisit(payload: VisitCreationPayload): Promise<VisitCreationResponse> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Comprobar si visitante existe
      const visitanteRes = await client.query(
        `SELECT id FROM visitante WHERE dni = $1`,
        [payload.visitor.dni]
      );

      let visitanteId: number;

      if (visitanteRes.rowCount === 0) {
        // Insertar nuevo visitante
        const insertVisitor = await client.query(
          `INSERT INTO visitante (dni, nom, empresa, num_visitants, desconegut) 
           VALUES ($1, $2, $3, $4, false) RETURNING id`,
          [
            payload.visitor.dni,
            payload.visitor.name,
            payload.visitor.company,
            payload.visitDetails.visitors
          ]
        );
        visitanteId = insertVisitor.rows[0].id;
      } else {
        visitanteId = visitanteRes.rows[0].id;
      }

      // Obtener la delegación del empleado
      const employeeRes = await client.query(
        `SELECT delegacio_id FROM treballador WHERE id = $1`,
        [payload.visit.employeeId]
      );

      if (employeeRes.rowCount === 0) {
        throw new Error('Empleado no encontrado');
      }

      const delegacioId = employeeRes.rows[0].delegacio_id;

      // Insertar visita con los campos correctos de la nueva base de datos
      const insertVisit = await client.query(
        `INSERT INTO visita 
          (visitante_id, treballador_id, delegacio_id, data_visita, hora_ini, tarjeta_id, pendent, observacions) 
         VALUES 
          ($1, $2, $3, $4, $5, $6, $7, $8) 
         RETURNING id`,
        [
          visitanteId,
          payload.visit.employeeId,
          delegacioId,
          payload.createdAt.split('T')[0], // fecha YYYY-MM-DD
          payload.createdAt.split('T')[1].split('.')[0], // hora HH:MM:SS
          payload.visitDetails.cardNumber,
          true,                           // pendiente
          payload.visitDetails.observations || ''
        ]
      );

      const visitId = insertVisit.rows[0].id;

      await client.query('COMMIT');

      return { visitId, id: visitanteId };
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al crear visita:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  async updateVisit(id: number, payload: VisitUpdatePayload): Promise<void> {
    try {
        await pool.query(
        `UPDATE visita
        SET pendent = false,  -- ya no pendiente
            hora_fi = $1,
            observacions = $2
        WHERE id = $3`,
        [payload.endTime, payload.dischargeObservations, id]
        );
    } catch (error) {
        console.error('Error al actualizar visita:', error);
        throw error;
    }
    }

}
