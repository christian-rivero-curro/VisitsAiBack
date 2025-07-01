import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Importar la conexión a la BD
import pool from './database/db';

import employeeRoutes from './api/employeeRoutes';
import visitRoutes from './api/visitRoutes';
import statisticsRoutes from './api/statisticsRoutes';
import userRoutes from './api/userRoutes';

const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para logging de requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint con verificación de BD
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      service: 'visitors-backend',
      version: '1.0.0',
      database: 'Connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'ERROR', 
      timestamp: new Date().toISOString(),
      service: 'visitors-backend',
      version: '1.0.0',
      database: 'Disconnected'
    });
  }
});

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', userRoutes);

// Middleware para rutas no encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'API endpoint not found',
    error: `Route ${req.method} ${req.originalUrl} does not exist`,
    availableEndpoints: [
      'GET /health',
      'GET /api/employees',
      'GET /api/visits',
      'POST /api/visits',
      'PATCH /api/visits/:id',
      'GET /api/statistics',
      'GET /api/users',
      'GET /api/users/:id'
    ]
  });
});

app.listen(port, () => {
  console.log(`Backend server (connected to PostgreSQL) running at http://localhost:${port}`);
});