import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface UserData {
    did: string;
    publicKey: string;
    credentialId: string;
    deviceInfo: {
        hardwareId: string;
        deviceType: string;
        deviceName: string;
        platform?: string;
        authenticatorType?: string;
    };
    enrolledAt: string;
}

interface AuthContextType {
    user: UserData | null;
    isAuthenticated: boolean;
    login: (userData: UserData) => void;
    logout: () => void;
    updateUser: (userData: Partial<UserData>) => void;
    profile: any;
    loadingProfile: boolean;
    checkProfile: (did: string) => Promise<void>;
    updateProfileState: (newProfile: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<UserData | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const [profile, setProfile] = useState<any>(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    useEffect(() => {
        // Check if user is already logged in
        const storedUser = localStorage.getItem('praman_user');
        if (storedUser) {
            try {
                const userData = JSON.parse(storedUser);
                setUser(userData);
                setIsAuthenticated(true);
                // Fetch profile
                fetchProfile(userData.did);
            } catch (error) {
                console.error('Failed to parse user data:', error);
                localStorage.removeItem('praman_user');
            }
        }
    }, []);

    const fetchProfile = async (did: string) => {
        setLoadingProfile(true);
        try {
            const API_BASE_URL = 'http://localhost:3000/api';
            const res = await fetch(`${API_BASE_URL}/profile/${did}`);
            const data = await res.json();
            if (data.success) {
                setProfile(data.profile);
            } else {
                setProfile(null);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoadingProfile(false);
        }
    };

    const login = (userData: UserData) => {
        setUser(userData);
        setIsAuthenticated(true);
        localStorage.setItem('praman_user', JSON.stringify(userData));
        localStorage.setItem('praman_did', userData.did);
        fetchProfile(userData.did);
    };

    const logout = () => {
        setUser(null);
        setProfile(null);
        setIsAuthenticated(false);
        localStorage.removeItem('praman_user');
        localStorage.removeItem('praman_did');
        localStorage.removeItem('praman_publicKey');
        localStorage.removeItem('praman_credentialId');
        localStorage.removeItem('health_portal_session');
    };

    const updateUser = (userData: Partial<UserData>) => {
        if (user) {
            const updatedUser = { ...user, ...userData };
            setUser(updatedUser);
            localStorage.setItem('praman_user', JSON.stringify(updatedUser));
        }
    };

    const updateProfileState = (newProfile: any) => {
        setProfile(newProfile);
    };

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            login,
            logout,
            updateUser,
            profile,
            loadingProfile,
            checkProfile: fetchProfile,
            updateProfileState
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
