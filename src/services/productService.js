// src/services/productService.js
import API from '../api/axios';

export const productService = {
    async getAll() {
        const response = await API.get('/products');
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/products/${id}`);
        return response.data;
    },

    async create(product) {
        const response = await API.post('/products', product);
        return response.data;
    },

    async update(id, product) {
        const response = await API.put(`/products/${id}`, product);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/products/${id}`);
        return response.data;
    },
};
