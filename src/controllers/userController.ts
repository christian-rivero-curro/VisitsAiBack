import { Request, Response } from 'express';
import * as userService from '../services/userService';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error: any) {
    console.error('Error in getUsers controller:', error);
    
    if (error.message?.includes('JSON_SERVER_URL')) {
      return res.status(500).json({ 
        message: 'Server configuration error', 
        error: 'Database connection not configured' 
      });
    }
    
    if (error.message?.includes('Failed to fetch')) {
      return res.status(503).json({ 
        message: 'Service temporarily unavailable', 
        error: 'Unable to connect to database' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error fetching users', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};

export const getUser = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const user = await userService.getUserById(id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error: any) {
    console.error('Error in getUser controller:', error);
    if (error.message?.includes('JSON_SERVER_URL')) {
      return res.status(500).json({ 
        message: 'Server configuration error', 
        error: 'Database connection not configured' 
      });
    }
    
    if (error.message?.includes('Failed to fetch')) {
      return res.status(503).json({ 
        message: 'Service temporarily unavailable', 
        error: 'Unable to connect to database' 
      });
    }
    res.status(500).json({ 
      message: 'Error fetching user', 
      error: error.message || 'Unknown error occurred' 
    });
  }
};