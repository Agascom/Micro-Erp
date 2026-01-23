// src/services/messageService.js
import API from '../api/axios';

export const messageService = {
    // Templates Email
    async getEmailTemplates() {
        const response = await API.get('/messages/email-templates');
        return response.data;
    },

    async createEmailTemplate(template) {
        const response = await API.post('/messages/email-templates', template);
        return response.data;
    },

    async updateEmailTemplate(id, template) {
        const response = await API.put(`/messages/email-templates/${id}`, template);
        return response.data;
    },

    // Templates SMS
    async getSmsTemplates() {
        const response = await API.get('/messages/sms-templates');
        return response.data;
    },

    async createSmsTemplate(template) {
        const response = await API.post('/messages/sms-templates', template);
        return response.data;
    },

    // Envoyer facture par email
    async sendInvoiceEmail(invoiceId, data = {}) {
        const response = await API.post(`/messages/invoices/${invoiceId}/send-email`, data);
        return response.data;
    },

    // Envoyer devis par email
    async sendQuoteEmail(quoteId, data = {}) {
        const response = await API.post(`/messages/quotes/${quoteId}/send-email`, data);
        return response.data;
    },

    // Historique des messages
    async getLogs(type = null, status = null) {
        const params = new URLSearchParams();
        if (type) params.append('type', type);
        if (status) params.append('status', status);
        const response = await API.get(`/messages/logs?${params}`);
        return response.data;
    }
};
