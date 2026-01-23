// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Vérifier si l'utilisateur est déjà connecté au chargement
        const checkAuth = async () => {
            const token = authService.getToken();
            if (token) {
                try {
                    const userData = await authService.getUser();
                    setUser(userData);
                    setIsAuthenticated(true);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (email, password) => {
        const result = await authService.login(email, password);
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
    };

    const loginClient = async (email, password) => {
        const result = await authService.loginClient(email, password);
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
    };

    const register = async (name, email, password, password_confirmation) => {
        const result = await authService.register(name, email, password, password_confirmation);
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
    };

    const logout = async () => {
        await authService.logout();
        setUser(null);
        setIsAuthenticated(false);
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        loginClient,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
