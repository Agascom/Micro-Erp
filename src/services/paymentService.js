// src/services/paymentService.js
import API from '../api/axios';

export const paymentService = {
    // Liste des paiements
    async getAll() {
        const response = await API.get('/payments');
        return response.data;
    },

    // Détails d'un paiement
    async getById(id) {
        const response = await API.get(`/payments/${id}`);
        return response.data;
    },

    // Enregistrer un paiement
    async create(payment) {
        const response = await API.post('/payments', payment);
        return response.data;
    },

    // Supprimer/Rembourser un paiement
    async delete(id) {
        const response = await API.delete(`/payments/${id}`);
        return response.data;
    },

    // Historique des paiements d'une facture
    async getInvoicePayments(invoiceId) {
        const response = await API.get(`/invoices/${invoiceId}/payments`);
        return response.data;
    }
};

export const paymentMethodService = {
    // Liste des méthodes de paiement
    async getAll() {
        const response = await API.get('/payment-methods');
        return response.data;
    },

    // Créer une méthode
    async create(method) {
        const response = await API.post('/payment-methods', method);
        return response.data;
    },

    // Modifier une méthode
    async update(id, method) {
        const response = await API.put(`/payment-methods/${id}`, method);
        return response.data;
    },

    // Supprimer une méthode
    async delete(id) {
        const response = await API.delete(`/payment-methods/${id}`);
        return response.data;
    }
};

export const paymentReminderService = {
    // Liste des relances
    async getAll() {
        const response = await API.get('/payment-reminders');
        return response.data;
    },

    // Planifier une relance
    async create(reminder) {
        const response = await API.post('/payment-reminders', reminder);
        return response.data;
    },

    // Relances en attente
    async getPending() {
        const response = await API.get('/payment-reminders/pending');
        return response.data;
    },

    // Marquer comme envoyée
    async markAsSent(id) {
        const response = await API.post(`/payment-reminders/${id}/sent`);
        return response.data;
    },

    // Créer automatiquement pour factures en retard
    async autoCreate() {
        const response = await API.post('/payment-reminders/auto-create');
        return response.data;
    },

    // Supprimer une relance
    async delete(id) {
        const response = await API.delete(`/payment-reminders/${id}`);
        return response.data;
    }
};
