import React, { useState, useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { userApi } from '../services/api';

interface ProtectedRouteProps {
    adminOnly?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ adminOnly = false }) => {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const res = await userApi.profile();
                if (res.data && res.data.status) {
                    setIsAuthenticated(true);
                    setIsAdmin(res.data.data.isAdmin || false);
                } else {
                    setIsAuthenticated(false);
                    setIsAdmin(false);
                }
            } catch (error) {
                setIsAuthenticated(false);
                setIsAdmin(false);
            }
        };

        verifyUser();
    }, []);

    // While validating authentication state
    if (isAuthenticated === null) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-32 pb-16 flex justify-center items-center">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    // If not logged in, redirect to login page
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If route requires admin, but user is not admin
    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    // Render child routes
    return <Outlet />;
};

export default ProtectedRoute;
