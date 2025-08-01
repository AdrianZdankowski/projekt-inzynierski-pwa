import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { decodeUserRole } from "../lib/decodeUserRole";
import axiosInstance from "../api/axiosInstance";

interface AuthContextType {
    accessToken: string | null;
    login: (accessToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    isRefreshing: boolean;
    userRole?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [userRole, setUserRole] = useState<string | undefined>();

    const login = (accessToken: string) => {
        setAccessToken(accessToken);
        setUserRole(decodeUserRole(accessToken));
        localStorage.setItem("isLoggedIn", "true");
    };

    const logout = () => {
        setAccessToken(null);
        setUserRole(undefined);
        localStorage.removeItem("isLoggedIn");
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
            console.log('Session expired');
        }
        finally {
            setIsRefreshing(true);
        }
    };

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("isLoggedIn");
        if (isLoggedIn) restoreSession();
    }, []);

    return (
        <AuthContext.Provider value={{accessToken, login, logout, isAuthenticated: !!accessToken, isRefreshing, userRole}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) throw new Error("useAuth must be used within AuthProvider");
        return context;
    }