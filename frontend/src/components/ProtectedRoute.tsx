import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ReactNode } from "react";
import { Box, CircularProgress } from "@mui/material";

interface ProtectedRouteProps {
    children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
    const {isAuthenticated, isRefreshing} = useAuth();

    if (isRefreshing) return (
    <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
        <CircularProgress/>
    </Box>)

    return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace/>;
}

export default ProtectedRoute;