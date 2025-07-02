import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import pool from './database/db';
import routes from './routes'; // tu único archivo de rutas

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/health', async (req: Request, res: Response) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'visitors-backend',
      version: '1.0.0',
      database: 'Connected',
    });
  } catch {
    res.status(503).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      service: 'visitors-backend',
      version: '1.0.0',
      database: 'Disconnected',
    });
  }
});

// Usar las rutas centralizadas
app.use('/api', routes);

// 404 handler para rutas no encontradas
app.use('*', (req: Request, res: Response) => {
  res.status(404).json({
    message: 'API endpoint not found',
    error: `Route ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /api/employees',
      'GET /api/visits',
      'POST /api/visits',
      'PATCH /api/visits/:id',
    ],
  });
});

app.listen(port, () => {
  console.log(`Backend server running at http://localhost:${port}`);
});
