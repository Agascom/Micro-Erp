// src/services/authService.js
import API from '../api/axios';

export const authService = {
    async login(email, password) {
        const response = await API.post('/login', { email, password });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        // Récupérer les infos utilisateur après login
        const userResponse = await API.get('/user');
        localStorage.setItem('user', JSON.stringify(userResponse.data));
        return { token: access_token, user: userResponse.data };
    },

    async loginClient(email, password) {
        const response = await API.post('/client/login', { email, password });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        // Use a different endpoint or specific logic for client user data if needed
        const userResponse = await API.get('/client/profile'); // Assuming a profile endpoint for clients
        const clientData = { ...userResponse.data, role: 'client' }; // Force role
        localStorage.setItem('user', JSON.stringify(clientData));
        return { token: access_token, user: clientData };
    },

    async register(name, email, password, password_confirmation) {
        const response = await API.post('/register', {
            name,
            email,
            password,
            password_confirmation,
        });
        const { access_token } = response.data;
        localStorage.setItem('token', access_token);
        // Récupérer les infos utilisateur après inscription
        const userResponse = await API.get('/user');
        localStorage.setItem('user', JSON.stringify(userResponse.data));
        return { token: access_token, user: userResponse.data };
    },

    async logout() {
        try {
            await API.post('/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    async getUser() {
        const response = await API.get('/user');
        return response.data;
    },

    isAuthenticated() {
        return !!localStorage.getItem('token');
    },

    getStoredUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem('token');
    }
};
