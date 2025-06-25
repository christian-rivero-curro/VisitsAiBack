const JSON_SERVER_URL = process.env.JSON_SERVER_URL;

export const getAllUsers = async () => {
    if (!JSON_SERVER_URL) {
        throw new Error('JSON_SERVER_URL environment variable is not configured');
    }

    try {
        const response = await fetch(`${JSON_SERVER_URL}/users`);
        
        if (!response.ok) {
            throw new Error(`Failed to fetch users from json-server: ${response.status} ${response.statusText}`);
        }
        
        const users = await response.json();
        
        if (!Array.isArray(users)) {
            throw new Error('Invalid response format: expected array of users');
        }
        
        return users;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Unknown error occurred while fetching users');
    }
};

export const getUserById = async (id: string) => {
    if (!JSON_SERVER_URL) {
        throw new Error('JSON_SERVER_URL environment variable is not configured');
    }

    try {
        const response = await fetch(`${JSON_SERVER_URL}/users/${id}`);
        
        if (!response.ok) {
            if (response.status === 404) {
                return null; // User not found
            }
            throw new Error(`Failed to fetch user from json-server: ${response.status} ${response.statusText}`);
        }
        
        const user = await response.json();
        
        return user;
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error('Unknown error occurred while fetching user by ID');
    }
};