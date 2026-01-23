// src/services/apiManagementService.js
import API from '../api/axios';

export const apiKeyService = {
    // Liste des clés API
    async getAll() {
        const response = await API.get('/api-keys');
        return response.data;
    },

    // Créer une clé API
    async create(data) {
        const response = await API.post('/api-keys', data);
        return response.data;
    },

    // Révoquer une clé
    async revoke(id) {
        const response = await API.post(`/api-keys/${id}/revoke`);
        return response.data;
    },

    // Supprimer une clé
    async delete(id) {
        const response = await API.delete(`/api-keys/${id}`);
        return response.data;
    }
};

export const webhookService = {
    // Liste des webhooks
    async getAll() {
        const response = await API.get('/webhooks');
        return response.data;
    },

    // Créer un webhook
    async create(webhook) {
        const response = await API.post('/webhooks', webhook);
        return response.data;
    },

    // Modifier un webhook
    async update(id, webhook) {
        const response = await API.put(`/webhooks/${id}`, webhook);
        return response.data;
    },

    // Supprimer un webhook
    async delete(id) {
        const response = await API.delete(`/webhooks/${id}`);
        return response.data;
    },

    // Historique des envois
    async getDeliveries(id) {
        const response = await API.get(`/webhooks/${id}/deliveries`);
        return response.data;
    },

    // Tester un webhook
    async test(id) {
        const response = await API.post(`/webhooks/${id}/test`);
        return response.data;
    },

    // Événements disponibles
    async getAvailableEvents() {
        const response = await API.get('/webhooks/available-events');
        return response.data;
    }
};
