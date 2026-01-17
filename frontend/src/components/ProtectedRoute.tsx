import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

/**
 * Protected Route Component
 * Redirects to home page if user is not authenticated
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                fontSize: '24px',
                fontWeight: 600
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '64px', marginBottom: '16px' }}>🇮🇳</div>
                    <div>Loading Bharat-ID...</div>
                </div>
            </div>
        );
    }

    // Redirect to home if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Render children if authenticated
    return <>{children}</>;
};

export default ProtectedRoute;
