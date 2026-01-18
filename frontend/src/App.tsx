import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import EnrollmentPage from './pages/EnrollmentPage';
import HealthCallbackPage from './pages/HealthCallbackPage';

import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import ServicesPage from './pages/ServicesPage';
import SettingsPage from './pages/SettingsPage';
import MyFamilyPage from './pages/MyFamilyPage';
import HowItWorksPage from './pages/HowItWorksPage';
import MicroservicesDashboard from './pages/MicroservicesDashboard';
import FlowCDemo from './pages/FlowCDemo';
import HealthPortalPage from './pages/HealthPortalPage';
import GlobalOnboardingWrapper from './components/GlobalOnboardingWrapper';
import ConsentPage from './pages/ConsentPage';

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <GlobalOnboardingWrapper />
                <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/enroll" element={<EnrollmentPage />} />
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/oauth/consent" element={<ConsentPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/services" element={<ServicesPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/my-family" element={<MyFamilyPage />} />
                    <Route path="/how-it-works" element={<HowItWorksPage />} />
                    {/* Healthcare & Microservices */}
                    <Route path="/health" element={<HealthPortalPage />} />
                    <Route path="/health-callback" element={<HealthCallbackPage />} />
                    <Route path="/microservices" element={<MicroservicesDashboard />} />
                    <Route path="/flow-c-demo" element={<FlowCDemo />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
