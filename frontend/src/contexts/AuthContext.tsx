import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Types
interface User {
    did: string;
    profile?: {
        bloodGroup?: string;
        farmerStatus?: string;
        residencyStatus?: string;
        fullName?: string;
        dateOfBirth?: string;
        address?: string;
        phone?: string;
    };
    deviceInfo?: {
        type: string;
        name: string;
    };
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (userData: User) => void;
    logout: () => void;
    updateProfile: (profile: Partial<User['profile']>) => void;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Storage Keys
const STORAGE_KEY = 'bharat_id_session';
const SESSION_TIMESTAMP_KEY = 'bharat_id_session_timestamp';
const SESSION_EXPIRY_HOURS = 24; // 24 hours session

// Provider Component
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUserFromStorage = () => {
            try {
                const storedUser = localStorage.getItem(STORAGE_KEY);
                const timestamp = localStorage.getItem(SESSION_TIMESTAMP_KEY);

                if (storedUser && timestamp) {
                    const sessionAge = Date.now() - parseInt(timestamp);
                    const maxAge = SESSION_EXPIRY_HOURS * 60 * 60 * 1000; // hours to milliseconds

                    // Check if session has expired
                    if (sessionAge < maxAge) {
                        const userData = JSON.parse(storedUser);
                        setUser(userData);
                        console.log('✅ Session restored:', userData.did);
                    } else {
                        // Session expired, clear storage
                        console.log('⏰ Session expired, clearing...');
                        localStorage.removeItem(STORAGE_KEY);
                        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
                    }
                }
            } catch (error) {
                console.error('Failed to load user from storage:', error);
                localStorage.removeItem(STORAGE_KEY);
                localStorage.removeItem(SESSION_TIMESTAMP_KEY);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserFromStorage();
    }, []);

    // Login function
    const login = (userData: User) => {
        try {
            setUser(userData);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
            localStorage.setItem(SESSION_TIMESTAMP_KEY, Date.now().toString());
            console.log('✅ User logged in:', userData.did);
        } catch (error) {
            console.error('Failed to save user to storage:', error);
        }
    };

    // Logout function
    const logout = () => {
        setUser(null);
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(SESSION_TIMESTAMP_KEY);
        console.log('👋 User logged out');
    };

    // Update profile function
    const updateProfile = (profileData: Partial<User['profile']>) => {
        if (user) {
            const updatedUser = {
                ...user,
                profile: {
                    ...user.profile,
                    ...profileData
                }
            };
            setUser(updatedUser);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));
            console.log('✅ Profile updated');
        }
    };

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        updateProfile
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use auth context
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export default AuthContext;
