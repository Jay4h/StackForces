import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EnrollmentPage from './pages/EnrollmentPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import ProfilePage from './pages/ProfilePage';
import ServicesPage from './pages/ServicesPage';
import SettingsPage from './pages/SettingsPage';
import MyFamilyPage from './pages/MyFamilyPage';
import HowItWorksPage from './pages/HowItWorksPage';
import MicroservicesDashboard from './pages/MicroservicesDashboard';
import FlowCDemo from './pages/FlowCDemo';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/enroll" element={<EnrollmentPage />} />
                <Route path="/home" element={<HomePage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/my-family" element={<MyFamilyPage />} />
                <Route path="/how-it-works" element={<HowItWorksPage />} />
                {/* Microservices & Healthcare Flows */}
                <Route path="/microservices" element={<MicroservicesDashboard />} />
                <Route path="/flow-c-demo" element={<FlowCDemo />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
