// src/services/auditService.js
import API from '../api/axios';

export const auditService = {
    // Journal d'activités
    async getActivityLogs(filters = {}) {
        const params = new URLSearchParams();
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.action) params.append('action', filters.action);
        if (filters.model_type) params.append('model_type', filters.model_type);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        const response = await API.get(`/audit/activity-logs?${params}`);
        return response.data;
    },

    // Historique des connexions
    async getLoginLogs(filters = {}) {
        const params = new URLSearchParams();
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.action) params.append('action', filters.action);
        if (filters.start_date) params.append('start_date', filters.start_date);
        if (filters.end_date) params.append('end_date', filters.end_date);
        const response = await API.get(`/audit/login-logs?${params}`);
        return response.data;
    },

    // Logs des appels API
    async getApiLogs(filters = {}) {
        const params = new URLSearchParams();
        if (filters.user_id) params.append('user_id', filters.user_id);
        if (filters.endpoint) params.append('endpoint', filters.endpoint);
        if (filters.method) params.append('method', filters.method);
        const response = await API.get(`/audit/api-logs?${params}`);
        return response.data;
    },

    // Historique d'un enregistrement
    async getModelHistory(modelType, modelId) {
        const response = await API.get(`/audit/model/${modelType}/${modelId}`);
        return response.data;
    },

    // Activité d'un utilisateur
    async getUserActivity(userId) {
        const response = await API.get(`/audit/user/${userId}`);
        return response.data;
    },

    // Résumé du jour
    async getSummary() {
        const response = await API.get('/audit/summary');
        return response.data;
    }
};
