// src/services/reportService.js
import API from '../api/axios';

export const reportService = {
    // Rapport de ventes
    async getSalesReport(startDate, endDate, groupBy = 'day') {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (groupBy) params.append('group_by', groupBy);
        const response = await API.get(`/reports/sales?${params}`);
        return response.data;
    },

    // Rentabilité par produit
    async getProfitabilityByProduct(startDate, endDate, limit = 20) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (limit) params.append('limit', limit);
        const response = await API.get(`/reports/profitability/products?${params}`);
        return response.data;
    },

    // Rentabilité par client
    async getProfitabilityByClient(startDate, endDate, limit = 20) {
        const params = new URLSearchParams();
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        if (limit) params.append('limit', limit);
        const response = await API.get(`/reports/profitability/clients?${params}`);
        return response.data;
    },

    // Rapport d'inventaire
    async getInventoryReport() {
        const response = await API.get('/reports/inventory');
        return response.data;
    },

    // Export CSV
    async exportCsv(type, startDate, endDate) {
        const params = new URLSearchParams();
        params.append('type', type);
        if (startDate) params.append('start_date', startDate);
        if (endDate) params.append('end_date', endDate);
        const response = await API.get(`/reports/export?${params}`, { responseType: 'blob' });
        return response.data;
    },

    // Sauvegarder un rapport
    async saveReport(data) {
        const response = await API.post('/reports/save', data);
        return response.data;
    },

    // Liste des rapports sauvegardés
    async getSavedReports() {
        const response = await API.get('/reports/saved');
        return response.data;
    },

    // Supprimer un rapport sauvegardé
    async deleteSavedReport(id) {
        const response = await API.delete(`/reports/saved/${id}`);
        return response.data;
    }
};
