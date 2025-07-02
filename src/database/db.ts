import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_DATABASE,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT) || 5432, // Usar 5432 como puerto por defecto
});

// Opcional: Probar la conexión al iniciar
pool.connect((err, client, release) => {
  if (err) {
    return console.error('Error acquiring client', err.stack);
  }
  console.log('¡Conexión a la base de datos PostgreSQL exitosa!');
  if (client) {
    client.release();
  }
});

export default pool;