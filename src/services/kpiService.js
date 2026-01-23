// src/services/kpiService.js
import API from '../api/axios';

export const kpiService = {
    // Dashboard KPI
    async getDashboard() {
        const response = await API.get('/kpi/dashboard');
        return response.data;
    },

    // Liste des objectifs
    async getObjectives(status = null, userId = null) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (userId) params.append('user_id', userId);
        const response = await API.get(`/kpi/objectives?${params}`);
        return response.data;
    },

    // Détails d'un objectif
    async getObjective(id) {
        const response = await API.get(`/kpi/objectives/${id}`);
        return response.data;
    },

    // Créer un objectif
    async createObjective(objective) {
        const response = await API.post('/kpi/objectives', objective);
        return response.data;
    },

    // Mettre à jour la progression
    async updateObjectiveProgress(id, data = {}) {
        const response = await API.post(`/kpi/objectives/${id}/update-progress`, data);
        return response.data;
    },

    // Supprimer un objectif
    async deleteObjective(id) {
        const response = await API.delete(`/kpi/objectives/${id}`);
        return response.data;
    },

    // Définitions de KPI
    async getDefinitions() {
        const response = await API.get('/kpi/definitions');
        return response.data;
    },

    // Créer une définition
    async createDefinition(definition) {
        const response = await API.post('/kpi/definitions', definition);
        return response.data;
    },

    // Historique des valeurs
    async getHistory(kpiCode = null, periodType = null, startDate = null, endDate = null) {
        const params = new URLSearchParams();
        if (kpiCode) params.append('kpi_code', kpiCode);
        if (periodType) params.append('period_type', periodType);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const response = await API.get(`/kpi/history?${params}`);
        return response.data;
    }
};
