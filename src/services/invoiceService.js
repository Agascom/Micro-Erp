// src/services/invoiceService.js
import API from '../api/axios';

export const invoiceService = {
    async getAll() {
        const response = await API.get('/invoices');
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/invoices/${id}`);
        return response.data;
    },

    async create(invoice) {
        const response = await API.post('/invoices', invoice);
        return response.data;
    },

    async update(id, invoice) {
        const response = await API.put(`/invoices/${id}`, invoice);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/invoices/${id}`);
        return response.data;
    },
};
