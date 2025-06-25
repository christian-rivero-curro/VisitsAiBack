import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Ya no importamos la conexión a la BD
// import { connectDB } from './database/db'; 

import employeeRoutes from './api/employeeRoutes';
import visitRoutes from './api/visitRoutes';
import statisticsRoutes from './api/statisticsRoutes';
import userRoutes from './api/userRoutes'; // New: Import user routes


const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Middleware para logging de requests (opcional, útil para desarrollo)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'visitors-backend',
    version: '1.0.0'
  });
});


// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/statistics', statisticsRoutes);
app.use('/api/users', userRoutes); // New: Use user routes

// Middleware para manejar rutas no encontradas globalmente
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
      'GET /api/users', // New: Add to available endpoints
      'GET /api/users/:id' // New: Add to available endpoints
    ]
  });
});

// La función de arranque ahora es más simple
app.listen(port, () => {
  console.log(`Backend server (connected to json-server) running at http://localhost:${port}`);
});