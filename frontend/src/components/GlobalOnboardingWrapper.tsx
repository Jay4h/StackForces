import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileOnboarding from './ProfileOnboarding';
import { useLocation } from 'react-router-dom';

export default function GlobalOnboardingWrapper() {
    const { isAuthenticated, profile, loadingProfile } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(false);
    const location = useLocation();

    useEffect(() => {
        // Don't show on landing or enrollment pages
        if (location.pathname === '/' || location.pathname === '/enroll') {
            setShowOnboarding(false);
            return;
        }

        if (isAuthenticated && !loadingProfile) {
            // Check if profile exists and is complete
            if (!profile || !profile.isProfileComplete) {
                setShowOnboarding(true);
            } else {
                setShowOnboarding(false);
            }
        }
    }, [isAuthenticated, profile, loadingProfile, location.pathname]);

    return (
        <ProfileOnboarding
            isOpen={showOnboarding}
            onClose={() => setShowOnboarding(false)}
        />
    );
}
