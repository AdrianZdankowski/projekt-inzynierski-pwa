import { createContext, useContext, useState, ReactNode } from "react";

interface AuthContextType {
    accessToken: string | null;
    refreshToken: string | null;
    setTokens: (tokens: {accessToken: string, refreshToken: string}) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children}: {children: ReactNode}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null);
    const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refreshToken'));

    const setTokens = ({accessToken, refreshToken}: {accessToken: string, refreshToken: string}) => {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        localStorage.setItem('refreshToken', refreshToken);
    };

    const logout = () => {
        setAccessToken(null);
        setRefreshToken(null);
        localStorage.removeItem('refreshToken');
    };

    return (
        <AuthContext.Provider value={{accessToken, refreshToken, setTokens, logout}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
        const context = useContext(AuthContext);
        if (!context) throw new Error("useAuth must be used within AuthProvider");
        return context;
    }