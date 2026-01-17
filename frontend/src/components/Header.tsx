import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './Header.css';

const Header: React.FC = () => {
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const isActive = (path: string) => location.pathname === path;

    return (
        <header className="app-header">
            <div className="header-container">
                <Link to={isAuthenticated ? "/dashboard" : "/"} className="header-logo">
                    <span className="logo-icon">🇮🇳</span>
                    <div className="logo-text">
                        <h1>Bharat-ID</h1>
                        <p>Digital Identity System</p>
                    </div>
                </Link>

                {isAuthenticated && (
                    <nav className="header-nav">
                        <Link
                            to="/dashboard"
                            className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">🏠</span>
                            Dashboard
                        </Link>
                        <Link
                            to="/portals"
                            className={`nav-link ${isActive('/portals') ? 'active' : ''}`}
                        >
                            <span className="nav-icon">🌐</span>
                            Portals
                        </Link>
                    </nav>
                )}

                <div className="header-actions">
                    {isAuthenticated ? (
                        <div className="user-menu">
                            <div className="user-info">
                                <span className="user-icon">👤</span>
                                <div className="user-details">
                                    <span className="user-name">
                                        {user?.profile?.fullName || 'Bharat Citizen'}
                                    </span>
                                    <span className="user-did">
                                        {user?.did?.substring(0, 25)}...
                                    </span>
                                </div>
                            </div>
                            <button onClick={handleLogout} className="btn-logout">
                                <span>🚪</span>
                                Logout
                            </button>
                        </div>
                    ) : (
                        <Link to="/" className="btn-login">
                            🔐 Get Started
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;
