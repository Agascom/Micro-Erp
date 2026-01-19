// src/services/categoryService.js
import API from '../api/axios';

export const categoryService = {
    async getAll() {
        const response = await API.get('/categories');
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/categories/${id}`);
        return response.data;
    },

    async create(category) {
        const response = await API.post('/categories', category);
        return response.data;
    },

    async update(id, category) {
        const response = await API.put(`/categories/${id}`, category);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/categories/${id}`);
        return response.data;
    },
};
