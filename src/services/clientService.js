// src/services/clientService.js
import API from '../api/axios';

export const clientService = {
    async getAll() {
        const response = await API.get('/clients');
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/clients/${id}`);
        return response.data;
    },

    async create(client) {
        const response = await API.post('/clients', client);
        return response.data;
    },

    async update(id, client) {
        const response = await API.put(`/clients/${id}`, client);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/clients/${id}`);
        return response.data;
    },
};
