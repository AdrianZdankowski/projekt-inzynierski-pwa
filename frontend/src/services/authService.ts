export const register = async (data: {username: string, password: string}) => {
    const result = await fetch('http://localhost:5105/api/Auth/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });

    if (!result.ok) console.error("Register failed authservice")

    try {
        return await result.json();
    }
    catch {
        return null;
    }
}