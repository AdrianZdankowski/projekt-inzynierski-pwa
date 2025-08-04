import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const {isAuthenticated, isRefreshing} = useAuth();

    if (isRefreshing) return <h1>Ładowanie...</h1>

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace/>;
}

export default ProtectedRoute;