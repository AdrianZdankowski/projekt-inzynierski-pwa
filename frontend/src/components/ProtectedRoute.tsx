import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const {isAuthenticated, isRefreshing} = useAuth();

    // Można by tu użyć loadera, np kręcące się kółko
    if (!isRefreshing) return null;

    return isAuthenticated ? <>{children}</> : <Navigate to="/login"/>;
}

export default ProtectedRoute;