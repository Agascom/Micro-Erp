// src/services/stockMovementService.js
import API from '../api/axios';

export const stockMovementService = {
    async getAll() {
        const response = await API.get('/stock-movements');
        return response.data;
    },

    async create(movement) {
        const response = await API.post('/stock-movements', movement);
        return response.data;
    },
};
