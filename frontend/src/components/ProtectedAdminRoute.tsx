import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedAdminRoute = ({ children }: ProtectedRouteProps) => {
    const {isAuthenticated, isRefreshing, userRole} = useAuth();

    if (isRefreshing) return (
    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <CircularProgress/>
    </Box>)

    if (!isAuthenticated) return <Navigate to="/login" replace/>

    if (userRole !== 'Admin') return <Navigate to="/unauthorized" replace/>

    return <>{children}</>
}

export default ProtectedAdminRoute;