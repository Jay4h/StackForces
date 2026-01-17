import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import EnrollmentPage from './pages/EnrollmentPage';
import Dashboard from './pages/Dashboard';
import PortalSelector from './pages/PortalSelector';
import HealthPortal from './pages/HealthPortal';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/" element={<EnrollmentPage />} />

                    {/* Protected Routes */}
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/portals"
                        element={
                            <ProtectedRoute>
                                <PortalSelector />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/portal/health"
                        element={
                            <ProtectedRoute>
                                <HealthPortal />
                            </ProtectedRoute>
                        }
                    />

                    {/* Future routes: Agriculture & Smart City portals */}
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
