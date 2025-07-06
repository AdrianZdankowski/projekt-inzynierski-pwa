export const register = async (data: {username: string, password: string}) => {
    const result = await fetch('http://localhost:5105/api/Auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if (!result.ok) {
        const error = await result.json();
        throw new Error(error.message || 'Registration failed');
    }

    try {
        return await result.json();
    }
    catch {
        return null;
    }
};

export const login = async (data: {username: string, password: string}) => {
    const result = await fetch('http://localhost:5105/api/Auth/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    })

    if (!result.ok) {
        const error = await result.json();
        throw new Error(error.message || 'Registration failed');
    }

    return result.json();
};

export const refreshToken = async (refreshToken: string) => {
    const response = await fetch('http://localhost:5105/api/Auth/refresh-token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({refreshToken})
    });

    if (!response.ok) {
        throw new Error('Failed to refresh token');
    }
    
    return response.json();
};