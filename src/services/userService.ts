import pool from '../database/db';

export const getAllUsers = async () => {
  try {
    const query = `
      SELECT 
        dni as id,
        nom_complet as "fullName",
        rol as role,
        d.nom as building,
        NOW() as "lastAccess"
      FROM treballador t
      LEFT JOIN delegacio d ON t.delegacio_id = d.id
      WHERE rol IS NOT NULL
      ORDER BY nom_complet
    `;
    
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Database error in getAllUsers:', error);
    throw new Error('Failed to fetch users from database');
  }
};

export const getUserById = async (id: string) => {
  try {
    const query = `
      SELECT 
        dni as id,
        nom_complet as "fullName",
        rol as role,
        d.nom as building,
        NOW() as "lastAccess"
      FROM treballador t
      LEFT JOIN delegacio d ON t.delegacio_id = d.id
      WHERE dni = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Database error in getUserById:', error);
    throw new Error('Failed to fetch user by ID from database');
  }
};