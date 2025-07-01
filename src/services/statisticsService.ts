import pool from '../database/db';

export const getStatistics = async () => {
  try {
    // 1. Resumen general
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_visits,
        COUNT(CASE WHEN pendent = true THEN 1 END) as active_visits,
        COUNT(DISTINCT t.unitat_organica) as distinct_org_units
      FROM visita v
      JOIN treballador t ON v.treballador_id = t.id
      WHERE v.data_visita >= CURRENT_DATE - INTERVAL '30 days'
    `;
    
    const summaryResult = await pool.query(summaryQuery);
    const summary = {
      totalVisits: parseInt(summaryResult.rows[0].total_visits),
      activeVisits: parseInt(summaryResult.rows[0].active_visits),
      distinctOrgUnits: parseInt(summaryResult.rows[0].distinct_org_units)
    };

    // 2. Por día de la semana
    const weekdayQuery = `
      SELECT 
        CASE EXTRACT(DOW FROM data_visita)
          WHEN 1 THEN 'Dilluns'
          WHEN 2 THEN 'Dimarts'
          WHEN 3 THEN 'Dimecres'
          WHEN 4 THEN 'Dijous'
          WHEN 5 THEN 'Divendres'
        END as day,
        COUNT(*) as count
      FROM visita
      WHERE data_visita >= CURRENT_DATE - INTERVAL '30 days'
        AND EXTRACT(DOW FROM data_visita) BETWEEN 1 AND 5
      GROUP BY EXTRACT(DOW FROM data_visita)
      ORDER BY EXTRACT(DOW FROM data_visita)
    `;
    
    const weekdayResult = await pool.query(weekdayQuery);
    const byWeekday = weekdayResult.rows;

    // 3. Por unidad organizativa
    const orgUnitQuery = `
      SELECT 
        COALESCE(t.unitat_organica, 'Sense especificar') as orgUnit,
        COUNT(*) as count
      FROM visita v
      JOIN treballador t ON v.treballador_id = t.id
      WHERE v.data_visita >= CURRENT_DATE - INTERVAL '30 days'
      GROUP BY t.unitat_organica
      HAVING COUNT(*) > 1
      ORDER BY COUNT(*) DESC
    `;
    
    const orgUnitResult = await pool.query(orgUnitQuery);
    const byOrgUnit = orgUnitResult.rows;

    return {
      summary,
      byWeekday,
      byOrgUnit
    };
    
  } catch (error) {
    console.error('Database error in getStatistics:', error);
    throw new Error('Failed to fetch statistics from database');
  }
};