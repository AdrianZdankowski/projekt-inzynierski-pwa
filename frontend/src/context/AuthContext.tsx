import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { decodeUserRole } from "../utils/decodeUserRole";
import axiosInstance from "../api/axiosInstance";

interface AuthContextType {
    accessToken: string | null;
    login: (accessToken: string) => void;
    logout: (reason?: string) => void;
    refreshSession: () => Promise<boolean>;
    isAuthenticated: boolean;
    isRefreshing: boolean;
    userRole?: string;
    logoutReason?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(true);
    const [userRole, setUserRole] = useState<string | undefined>();
    const [logoutReason, setLogoutReason] = useState<string | undefined>();

    const login = (accessToken: string) => {
        setAccessToken(accessToken);
        setUserRole(decodeUserRole(accessToken));
        localStorage.setItem("isLoggedIn", "true");
    };

    const logout = (reason?: string) => {
        setAccessToken(null);
        setUserRole(undefined);
        localStorage.removeItem("isLoggedIn");
        setLogoutReason(reason);
    };

    const refreshSession = async (): Promise<boolean> => {
       try {
        const response = await axiosInstance.post('/auth/refresh-token', 
            {}, 
            {withCredentials: true}
        );

        const newToken = response.data.accessToken;
        if (newToken) {
            login(newToken);
            return true;
        }
        logout();
        return false;
       } 
       catch (error) {
        console.log("Failed to refresh session");
        logout();
        return false;
       }
    };

    const restoreSession = async () => {
       try {
        const isLoggedIn = localStorage.getItem("isLoggedIn");

        if (isLoggedIn) {
            await refreshSession();
        }
        else {
            logout();
        }
       } 
       catch (error) {
        console.log("No active session or session expired");
        logout();
       } finally {
        setIsRefreshing(false);
       }
    };

    useEffect(() => {
        restoreSession();
    }, []);

    return (
        <AuthContext.Provider value={{accessToken, login, logout, refreshSession, isAuthenticated: !!accessToken, isRefreshing, userRole, logoutReason}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) throw new Error("useAuth must be used within AuthProvider");
        return context;
    }