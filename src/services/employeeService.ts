import { Employee } from '../types';

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

export const getAllEmployees = async (): Promise<Employee[]> => {
  if (!JSON_SERVER_URL) {
    throw new Error('JSON_SERVER_URL environment variable is not configured');
  }

  try {
    const response = await fetch(`${JSON_SERVER_URL}/employees`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch employees from json-server: ${response.status} ${response.statusText}`);
    }
    
    const employees = await response.json();
    
    // Validar que la respuesta sea un array
    if (!Array.isArray(employees)) {
      throw new Error('Invalid response format: expected array of employees');
    }
    
    return employees;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Unknown error occurred while fetching employees');
  }
};