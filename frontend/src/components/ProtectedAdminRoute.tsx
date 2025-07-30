import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedRouteProps) => {
    const {isAuthenticated, isRefreshing, userRole} = useAuth();

    if(!isRefreshing) return null;

    if (!isAuthenticated) return <Navigate to="/login"/>

    if (userRole !== 'Admin') return <Navigate to="/unauthorized"/>

    return <>{children}</>
}

export default ProtectedAdminRoute;