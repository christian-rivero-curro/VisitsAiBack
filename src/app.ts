import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

// Ya no importamos la conexión a la BD
// import { connectDB } from './database/db'; 

import employeeRoutes from './api/employeeRoutes';
import visitRoutes from './api/visitRoutes';
import statisticsRoutes from './api/statisticsRoutes';


const app = express();
const port = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/employees', employeeRoutes);
app.use('/api/visits', visitRoutes);
app.use('/api/statistics', statisticsRoutes);

// La función de arranque ahora es más simple
app.listen(port, () => {
  console.log(`Backend server (connected to json-server) running at http://localhost:${port}`);
});