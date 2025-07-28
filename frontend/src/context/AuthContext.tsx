import { createContext, useContext, useState, ReactNode } from "react";
import { decodeUserRole } from "../lib/decodeUserRole";

interface AuthContextType {
    accessToken: string | null;
    login: (accessToken: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
    userRole?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [userRole, setUserRole] = useState<string | undefined>();

    const login = (accessToken: string) => {
        setAccessToken(accessToken);
        setUserRole(decodeUserRole(accessToken));
    };

    const logout = () => {
        setAccessToken(null);
    };

    return (
        <AuthContext.Provider value={{accessToken, login, logout, isAuthenticated: !!accessToken, userRole}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) throw new Error("useAuth must be used within AuthProvider");
        return context;
    }