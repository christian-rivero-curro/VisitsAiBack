import { VisitVisitor, VisitCreationPayload, VisitCreationResponse, VisitResponse, VisitUpdatePayload, VisitFilters } from '../types';
import pool from '../database/db';

export class VisitVisitorService {
  // Obtener todas las visitas con datos combinados de visitante y empleado
  async getAllVisits(filters?: VisitFilters): Promise<VisitResponse[]> {
    try {
        const conditions: string[] = [];
        const values: any[] = [];

        if (filters) {
        if (filters.dni_like) {
            values.push(`%${filters.dni_like}%`);
            conditions.push(`vis.dni ILIKE $${values.length}`);
        }
        if (filters.name_like) {
            values.push(`%${filters.name_like}%`);
            conditions.push(`vis.nom ILIKE $${values.length}`);
        }
        if (filters.status) {
            // Mapear el status a la lógica de la base de datos
            if (filters.status === 'pending') {
                conditions.push(`v.pendent = true`);
            } else if (filters.status === 'completed') {
                conditions.push(`v.pendent = false AND v.hora_fi IS NOT NULL`);
            } else if (filters.status === 'active') {
                conditions.push(`v.pendent = false AND v.hora_fi IS NULL`);
            }
        }
        if (filters.date) {
            values.push(filters.date);
            conditions.push(`v.data_visita = $${values.length}`);
        }
        }

        let whereClause = '';
        if (conditions.length > 0) {
        whereClause = 'WHERE ' + conditions.join(' AND ');
        }

        const query = `
        SELECT
            v.id,
            v.data_visita,
            v.hora_ini,
            v.hora_fi,
            v.pendent,
            vis.dni,
            vis.nom AS visitor_name,
            vis.empresa AS visitor_company,
            v.tarjeta_id,
            vis.num_visitants,
            t.nom_complet AS employee_name,
            t.direccio_general,
            t.unitat_organica,
            t.servei,
            t.ubicacio,
            t.numero
        FROM visita v
        JOIN visitante vis ON v.visitante_id = vis.id
        JOIN treballador t ON v.treballador_id = t.id
        ${whereClause}
        ORDER BY v.data_visita DESC, v.hora_ini DESC
        `;

        const result = await pool.query(query, values);

        return result.rows.map(row => ({
        id: row.id,
        createdAt: `${row.data_visita}T${row.hora_ini}`,
        endTime: row.hora_fi ? `${row.data_visita}T${row.hora_fi}` : undefined,
        status: row.pendent ? 'pending' : (row.hora_fi ? 'completed' : 'active'),
        visitor: {
            dni: row.dni,
            name: row.visitor_name,
            company: row.visitor_company || '',
            cardNumber: row.tarjeta_id || '',
            visitors: row.num_visitants,
            color: '', // No hay color en la nueva BD, se puede agregar después
        },
        visit: {
            name: row.employee_name,
            dg: row.direccio_general || '',
            orgUnit: row.unitat_organica || '',
            service: row.servei || '',
            location: row.ubicacio || '',
            phone: row.numero || '',
        }
        }));
    } catch (error) {
        console.error('Error al obtener visitas con filtros:', error);
        throw error;
    }
    }

  // Actualizar visita (cerrar visita)
  async updateVisit(id: number, payload: VisitUpdatePayload): Promise<void> {
    try {
      await pool.query(
        `UPDATE visita SET 
          pendent = false, 
          hora_fi = $1, 
          observacions = $2
         WHERE id = $3`,
        [payload.endTime?.split('T')[1]?.split('.')[0], payload.dischargeObservations, id]
      );
    } catch (error) {
      console.error('Error al actualizar visita:', error);
      throw error;
    }
  }
}