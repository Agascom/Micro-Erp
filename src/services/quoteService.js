// src/services/quoteService.js
import API from '../api/axios';

export const quoteService = {
    async getAll() {
        const response = await API.get('/quotes');
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/quotes/${id}`);
        return response.data;
    },

    async create(quote) {
        const response = await API.post('/quotes', quote);
        return response.data;
    },

    async update(id, quote) {
        const response = await API.put(`/quotes/${id}`, quote);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/quotes/${id}`);
        return response.data;
    },

    async convertToInvoice(id) {
        const response = await API.post(`/quotes/${id}/convert-to-invoice`);
        return response.data;
    },
};
