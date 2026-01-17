import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EnrollmentPage from './pages/EnrollmentPage';
import PortalSelector from './pages/PortalSelector';
import HealthPortal from './pages/HealthPortal';

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<EnrollmentPage />} />
                <Route path="/portals" element={<PortalSelector />} />
                <Route path="/portal/health" element={<HealthPortal />} />
                {/* Agriculture and SmartCity portals can be added similarly */}
            </Routes>
        </BrowserRouter>
    );
}

export default App;
