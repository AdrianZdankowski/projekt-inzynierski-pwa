import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { decodeUserRole } from "../lib/decodeUserRole";
import axiosInstance from "../api/axiosInstance";

interface AuthContextType {
    accessToken: string | null;
    login: (accessToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    authReady: boolean;
    userRole?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [authReady, setAuthReady] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | undefined>();

    const login = (accessToken: string) => {
        setAccessToken(accessToken);
        setUserRole(decodeUserRole(accessToken));
    };

    const logout = () => {
        setAccessToken(null);
    };

    const restoreSession = async () => {
        try {
            const response = await axiosInstance.post('/auth/refresh-token',
                {},
                {withCredentials: true}
            );
            const newToken = response.data.accessToken;
            if (newToken) login(newToken);
        }
        catch(error) {
            console.log('Sesja wygasła lub użytkownik nie był zalogowany');
        }
        finally {
            setAuthReady(true);
        }
    };

    useEffect(() => {
        restoreSession();
    }, []);

    return (
        <AuthContext.Provider value={{accessToken, login, logout, isAuthenticated: !!accessToken, authReady, userRole}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) throw new Error("useAuth must be used within AuthProvider");
        return context;
    }