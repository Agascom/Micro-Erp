// src/services/payslipService.js
import API from '../api/axios';

export const payslipService = {
    async getAll() {
        const response = await API.get('/payslips');
        return response.data;
    },

    async getById(id) {
        const response = await API.get(`/payslips/${id}`);
        return response.data;
    },

    async create(payslip) {
        const response = await API.post('/payslips', payslip);
        return response.data;
    },

    async update(id, payslip) {
        const response = await API.put(`/payslips/${id}`, payslip);
        return response.data;
    },

    async delete(id) {
        const response = await API.delete(`/payslips/${id}`);
        return response.data;
    },
};
