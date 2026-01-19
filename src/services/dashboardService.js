// src/services/dashboardService.js
import API from '../api/axios';

export const dashboardService = {
    async getStats() {
        const response = await API.get('/dashboard');
        return response.data;
    },
};
