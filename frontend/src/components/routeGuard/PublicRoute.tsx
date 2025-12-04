import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface PublicRouteProps {
    children: ReactNode;
}

const PublicRoute = ({ children }: PublicRouteProps) => {
    const { isAuthenticated, isRefreshing } = useAuth();

    if (isRefreshing) {
        return (
            <Box sx={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>
                <CircularProgress/>
            </Box>
        );
    }

    if (isAuthenticated) {
        return <Navigate to="/user-files" replace />;
    }

    return <>{children}</>;
};

export default PublicRoute;
