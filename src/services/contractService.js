// src/services/contractService.js
import API from '../api/axios';

export const contractService = {
    // Liste des contrats
    async getAll(status = null, clientId = null) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (clientId) params.append('client_id', clientId);
        const response = await API.get(`/contracts?${params}`);
        return response.data;
    },

    // Détails d'un contrat
    async getById(id) {
        const response = await API.get(`/contracts/${id}`);
        return response.data;
    },

    // Créer un contrat
    async create(contract) {
        const response = await API.post('/contracts', contract);
        return response.data;
    },

    // Modifier un contrat
    async update(id, contract) {
        const response = await API.put(`/contracts/${id}`, contract);
        return response.data;
    },

    // Supprimer un contrat
    async delete(id) {
        const response = await API.delete(`/contracts/${id}`);
        return response.data;
    },

    // Activer un contrat
    async activate(id) {
        const response = await API.post(`/contracts/${id}/activate`);
        return response.data;
    },

    // Contrats à renouveler
    async getRenewalReminders() {
        const response = await API.get('/contracts-renewal-reminders');
        return response.data;
    }
};

export const subscriptionService = {
    // Liste des abonnements
    async getAll(status = null, clientId = null) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (clientId) params.append('client_id', clientId);
        const response = await API.get(`/subscriptions?${params}`);
        return response.data;
    },

    // Détails d'un abonnement
    async getById(id) {
        const response = await API.get(`/subscriptions/${id}`);
        return response.data;
    },

    // Créer un abonnement
    async create(subscription) {
        const response = await API.post('/subscriptions', subscription);
        return response.data;
    },

    // Modifier un abonnement
    async update(id, subscription) {
        const response = await API.put(`/subscriptions/${id}`, subscription);
        return response.data;
    },

    // Mettre en pause
    async pause(id) {
        const response = await API.post(`/subscriptions/${id}/pause`);
        return response.data;
    },

    // Reprendre
    async resume(id) {
        const response = await API.post(`/subscriptions/${id}/resume`);
        return response.data;
    },

    // Annuler
    async cancel(id) {
        const response = await API.post(`/subscriptions/${id}/cancel`);
        return response.data;
    },

    // Abonnements à facturer
    async getDueBilling() {
        const response = await API.get('/subscriptions-due-billing');
        return response.data;
    },

    // Générer une facture
    async generateInvoice(id) {
        const response = await API.post(`/subscriptions/${id}/generate-invoice`);
        return response.data;
    }
};
