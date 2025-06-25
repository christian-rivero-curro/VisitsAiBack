import { Employee } from '../types';

const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

export const getAllEmployees = async (): Promise<Employee[]> => {
  const response = await fetch(`${JSON_SERVER_URL}/employees`);
  if (!response.ok) {
    throw new Error('Failed to fetch employees from json-server');
  }
  return response.json();
};